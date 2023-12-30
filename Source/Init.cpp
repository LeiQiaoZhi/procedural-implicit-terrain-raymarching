#include "Init.h"

namespace
{
	void framebuffer_size_callback(GLFWwindow* window, int width, int height)
	{
		glViewport(0, 0, width, height);
	}
}

void Init::init_glfw()
{
	glfwInit();

	// tell GLFW we are using opengl 3.3
	glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
	// tell GLFW we are using the core profile
	// which only have modern functions
	glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
}

void Init::setup_window(GLFWwindow* _window)
{
	// make the window into the current context (show it)
	glfwMakeContextCurrent(_window);
}

void Init::set_window_fullscreen(GLFWwindow* _window, bool _fullscreen)
{
	if (_fullscreen)
		glfwSetFramebufferSizeCallback(_window, framebuffer_size_callback);
	else 
		glfwSetFramebufferSizeCallback(_window, nullptr);
}
