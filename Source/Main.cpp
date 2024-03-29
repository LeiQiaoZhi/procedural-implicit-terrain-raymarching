#include <iostream>
#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>
#include <filesystem>
#include <string>
#include <chrono>

#include "Constants.h"
#include "Init.h"
#include "ShaderClass.h"
#include "VAO.h"
#include "EBO.h"
#include "Camera/CameraController.h"
#include "UI/UIApp.h"
#include "CallbackManager.h"
#include "Window.h"
#include "Utils.h"
#include "FPSCounter.h"

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

	VBO vbo(Constants::VERTICES, sizeof(Constants::VERTICES));
	EBO ebo(Constants::INDICES, sizeof(Constants::INDICES));

	// link vertex positions
	GLsizeiptr stride = 3 * sizeof(float);
	vao.link_attrib(vbo, 0, 3, GL_FLOAT, stride, (void*)0);

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

	// render loop
	while (!glfwWindowShouldClose(window)) {
		fps_counter.count_fps();
		// background color
		glClearColor(0.07f, 0.13f, 0.17f, 1.0f);
		glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT); // clear back color buffer to the clear color

		// activate the shader
		shader.activate();

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
	}

	glfwDestroyWindow(window);
	glfwTerminate();

	return 0;
}