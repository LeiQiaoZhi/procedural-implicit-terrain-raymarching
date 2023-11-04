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

	Init::setup_window(window, false);

	// load glad so it configures opengl
	gladLoadGL();

	Shader shader((SHADER_PATH "\\Minimum.vert"),{ 
		(SHADER_PATH "\\Raymarching.frag") 
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

	// render loop
	while (!glfwWindowShouldClose(window)) {
		// background color
		glClearColor(0.07f, 0.13f, 0.17f, 1.0f);
		glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT); // clear back color buffer to the clear color

		// activate the shader
		shader.activate();

		// set the uniforms
		GLint viewport[4];
		glGetIntegerv(GL_VIEWPORT, viewport);
		const GLint width = viewport[2];
		const GLint height = viewport[3];
		shader.set_uniform_vec2("iResolution", glm::vec2(width, height));

		const auto current_time = std::chrono::high_resolution_clock::now();
		const float time = std::chrono::duration<float, std::chrono::seconds::period>(current_time - start_time).count();
		shader.set_uniform_float("iTime", time);

		shader.set_uniform_vec3("iCameraPos", camera.get_position());
		shader.set_uniform_vec3("iCameraFwd", camera.get_forward());
		shader.set_uniform_vec3("iCameraUp", camera.get_up());
		shader.set_uniform_vec3("iCameraRight", camera.get_right());

		vao.bind();
		glDrawElements(GL_TRIANGLES, sizeof(Constants::INDICES) / sizeof(int), GL_UNSIGNED_INT, 0);

		camera_controller.handle_inputs(window, width, height);

		imgui_app.show_panels();
		
		glfwSwapBuffers(window);
		glfwPollEvents();
	}

	glfwDestroyWindow(window);
	glfwTerminate();

	return 0;
}