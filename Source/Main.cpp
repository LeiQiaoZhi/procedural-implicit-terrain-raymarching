#define GLFW_INCLUDE_NONE
#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <iostream>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>
#include <filesystem>
#include <string>
#include <chrono>
#include <stb/stb_image_write.h>

#include "Utils.h"
#include "Constants.h"
#include "Init.h"
#include "ShaderClass.h"
#include "VAO.h"
#include "EBO.h"
#include "Camera/CameraController.h"
#include "CallbackManager.h"
#include "Window.h"
#include "FPSCounter.h"
#include "RenderTarget.h"
#include "FBO.h"
#include "UI/UIApp.h"

namespace fs = std::filesystem;

void create_folder(const std::string& _path) {
	std::cout << "Creating folder " << _path << std::endl;
	fs::create_directories(_path);
}

std::string generate_unique_name(const std::string& _base_name) {
	auto now = std::chrono::system_clock::now();
	auto now_c = std::chrono::system_clock::to_time_t(now);

	std::stringstream ss;
	ss << _base_name << "_" << std::put_time(std::localtime(&now_c), "%Y%m%d_%H%M%S");

	return ss.str();
}


void save_framebuffer_to_image(FBO* _fbo, const std::string& _base_name, const std::string& _path) {
	_fbo->bind();
	glBindTexture(GL_TEXTURE_2D, _fbo->texture);

	const int width = Constants::WIDTH;
	const int height = Constants::HEIGHT;
	GLubyte* pixels = new GLubyte[4 * width * height];
	glGetTexImage(GL_TEXTURE_2D, 0, GL_RGBA, GL_UNSIGNED_BYTE, pixels);

	// Flip the image in memory
	GLubyte* flipped_pixels = new GLubyte[4 * width * height];
	for (int y = 0; y < height; ++y) {
		memcpy(flipped_pixels + (height - 1 - y) * width * 4, pixels + y * width * 4, width * 4);
	}

	std::string filename = generate_unique_name(_base_name);
	std::string file_path = _path + "\\" + filename + ".png";
	stbi_write_png(file_path.c_str(), width, height, 4, flipped_pixels, width * 4);

	std::cout << "Saved framebuffer to " << file_path << std::endl;

	// Clean up
	delete[] pixels;
	delete[] flipped_pixels;
	glBindTexture(GL_TEXTURE_2D, 0);
	_fbo->unbind();
}


int main()
{
	Init::init_glfw();

	// create a window
	GLFWwindow* window = glfwCreateWindow(Constants::WIDTH, Constants::HEIGHT, "Procedural Implicit Terrain Raymarching", NULL, NULL);
	if (window == NULL) {
		std::cout << "Failed to create glfw window." << std::endl;
		glfwTerminate();
		return -1;
	}

	// encapsulate the window in an object
	Window window_obj(window, Constants::WIDTH, Constants::HEIGHT);
	window_obj.set_icon(ICON_PATH);

	// load glad so it configures opengl
	gladLoadGL();

	Shader shader((SHADER_PATH "\\Others\\Minimum.vert"), {
		(SHADER_PATH "\\Main.frag")
		});

	// set up vertex array object
	VAO vao;
	vao.bind();

	VBO vbo(Constants::VERTICES_WITH_TEX, sizeof(Constants::VERTICES_WITH_TEX));
	EBO ebo(Constants::INDICES, sizeof(Constants::INDICES));

	// link vertex positions
	GLsizeiptr stride = 4 * sizeof(float);
	vao.link_attrib(vbo, 0, 2, GL_FLOAT, stride, (void*)0);
	vao.link_attrib(vbo, 1, 2, GL_FLOAT, stride, (void*)(2 * sizeof(float)));

	// unbind all to prevent accidentally modifying them
	vao.unbind();
	vbo.unbind();
	ebo.unbind();

	// init camera
	Camera camera(glm::vec3(0.0f, 100.0f, 0.0f));
	CameraController camera_controller(&camera);

	const auto start_time = std::chrono::high_resolution_clock::now();

	// Enables the Depth Buffer (z-buffer)
	glEnable(GL_DEPTH_TEST);

	// imgui
	UI::UIApp imgui_app(window, "#version 330");
	imgui_app.add_panels(shader, camera_controller);

	// glfw callbacks
	CallbackManager callback_manager(window);
	imgui_app.set_callbacks(callback_manager);
	camera_controller.set_callbacks(callback_manager);
	window_obj.set_callbacks(callback_manager);

	FPSCounter fps_counter(window, imgui_app.get_performance_panel());

	FBO fbo1(Constants::WIDTH, Constants::HEIGHT);
	fbo1.unbind();
	FBO fbo2(Constants::WIDTH, Constants::HEIGHT);
	fbo2.unbind();
	std::array<FBO*, 2> fbos = { &fbo1, &fbo2 };
	bool save_output = false;
	int incremental_steps = 0;
	constexpr int EVAL_STEPS = 4;
	int previous_index = 0;
	int current_index = 1;
	std::string output_base_name;
	std::string output_folder;

	// render loop
	while (!glfwWindowShouldClose(window)) {

		// activate the shader
		shader.activate();

		switch (RenderTarget::instance().get_render_target())
		{
		case RenderTarget::Target::Default:
			glBindFramebuffer(GL_FRAMEBUFFER, 0);
			save_output = false;
			shader.set_uniform_bool("iStartHDE", false);
			break;
		case RenderTarget::Target::IDE:
			// start incremental rendering
			incremental_steps = 20 + EVAL_STEPS;
			output_folder = (EVAL_IMAGES_PATH  "\\") + generate_unique_name("IDE");
			//output_folder = EVAL_IMAGES_PATH;
			create_folder(output_folder);
			// clear fbos for IDE
			for (auto fbo : fbos)
				fbo->clear();
			RenderTarget::instance().set_render_target(RenderTarget::Target::Default);
			break;
		case RenderTarget::Target::HDE:
			shader.set_uniform_bool("iStartHDE", true);
			output_base_name = "HDE";
			output_folder = EVAL_IMAGES_PATH;
			save_output = true;
			for (auto fbo : fbos)
				fbo->clear();
			fbos[current_index]->bind();
			RenderTarget::instance().set_render_target(RenderTarget::Target::Default);
			break;
		default:
			break;
		}
		if (incremental_steps > 0) {
			if (incremental_steps >= EVAL_STEPS) { // last few steps not for incremental rendering
				previous_index = incremental_steps % 2;
				current_index = (incremental_steps + 1) % 2;
			}
			std::cout << "Previous index: " << previous_index << " Current index: " << current_index << std::endl;

			fbos[current_index]->bind();

			// pass the previous framebuffer texture to the shader
			glActiveTexture(GL_TEXTURE0);
			glBindTexture(GL_TEXTURE_2D, fbos[previous_index]->texture);
			shader.set_uniform_int("iIncrementalTexture", 0);

			save_output = true;
			output_base_name = "IDE_" + std::to_string(incremental_steps);
			std::cout << "Rendering " << output_base_name << std::endl;
			incremental_steps--;
			shader.set_uniform_int("iIncrementalStepsLeft", incremental_steps);
			shader.set_uniform_bool("iStartIDE", true);
		}
		else {
			shader.set_uniform_bool("iStartIDE", false);
		}

		fps_counter.count_fps();
		// background color
		glClearColor(0.07f, 0.13f, 0.17f, 1.0f);
		glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT); // clear back color buffer to the clear color

		// set the uniforms
		glm::vec2 viewport_size = GLFWUtils::get_viewport_size(window);
		shader.set_uniform_vec2("iResolution", viewport_size);

		const auto current_time = std::chrono::high_resolution_clock::now();
		const float time = std::chrono::duration<float, std::chrono::seconds::period>(current_time - start_time).count();
		shader.set_uniform_float("iTime", time);

		camera_controller.set_shader_uniforms(shader);

		vao.bind();
		glDrawElements(GL_TRIANGLES, sizeof(Constants::INDICES) / sizeof(int), GL_UNSIGNED_INT, 0);

		camera_controller.handle_inputs(window, viewport_size.x, viewport_size.y);

		imgui_app.handle_inputs();
		imgui_app.show_panels();

		glfwSwapBuffers(window);
		glfwPollEvents();

		if (save_output) {
			save_framebuffer_to_image(fbos[current_index], output_base_name, output_folder);
		}
	}

	glfwDestroyWindow(window);
	glfwTerminate();

	return 0;
}