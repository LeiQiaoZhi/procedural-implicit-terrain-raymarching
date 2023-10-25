#include "ShaderClass.h"
#include "VAO.h"
#include "EBO.h"

#include <iostream>
#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>
#include <filesystem>
#include <string>

const int WIDTH = 1600;
const int HEIGHT = 1600;

float vertices[] = {
	-1.0f,  1.0f, -1.0f,  // Top-left
	-1.0f, -1.0f, -1.0f,  // Bottom-left
	 1.0f, -1.0f, -1.0f,  // Bottom-right
	 1.0f,  1.0f, -1.0f,   // Top-right
};

unsigned int indices[] = {
	0, 1, 2,   // First triangle
	2, 3, 0    // Second triangle
};


// callback function for dynamic viewport resizing
void framebuffer_size_callback(GLFWwindow* window, int width, int height) {
	glViewport(0, 0, width, height);
}

int main() {
	glfwInit();

	// tell GLFW we are using opengl 3.3
	glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
	// tell GLFW we are using the core profile
	// which only have modern functions
	glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

	// create a window
	GLFWwindow* window = glfwCreateWindow(WIDTH, HEIGHT, "Procedural Implicit Terrain Raymarching", NULL, NULL);
	// error checking
	if (window == NULL) {
		std::cout << "Failed to create glfw window." << std::endl;
		glfwTerminate();
		return -1;
	}
	// make the window into the current context (show it)
	glfwMakeContextCurrent(window);

	// set the framebuffer size callback for dynamic viewport resizing
	glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);

	// load glad so it configures opengl
	gladLoadGL();

	// specify the viewport of OpenGL in the window
	glViewport(0, 0, WIDTH, HEIGHT);

	Shader shader((SHADER_PATH "\\minimum.vert"),
		(SHADER_PATH "\\minimum.frag"));

	// set up vertex array object
	VAO vao;
	vao.bind();

	// create vertex buffer object to store vertices
	VBO vbo(vertices, sizeof(vertices));
	// create element buffer object to store indices
	EBO ebo(indices, sizeof(indices));

	// link vertex positions
	GLsizeiptr stride = 3 * sizeof(float);
	vao.link_attrib(vbo, 0, 3, GL_FLOAT, stride, (void*)0);

	// unbind all to prevent accidentally modifying them
	vao.unbind();
	vbo.unbind();
	ebo.unbind();

	// Enables the Depth Buffer (z-buffer)
	glEnable(GL_DEPTH_TEST);

	// render loop
	while (!glfwWindowShouldClose(window)) {
		// background color
		glClearColor(0.07f, 0.13f, 0.17f, 1.0f); // set clear color to dark blue
		glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT); // clear back color buffer to the clear color
		
		// activate the shader
		shader.activate();

		// set the uniforms
		GLint viewport[4];
		glGetIntegerv(GL_VIEWPORT, viewport);
		GLint width = viewport[2];
		GLint height = viewport[3];
		shader.set_uniform_vec2("iResolution", glm::vec2(width, height));

		vao.bind();
		glDrawElements(GL_TRIANGLES, sizeof(indices) / sizeof(int), GL_UNSIGNED_INT, 0);

		glfwSwapBuffers(window);
		glfwPollEvents();
	}

	glfwDestroyWindow(window);
	glfwTerminate();

	return 0;
}