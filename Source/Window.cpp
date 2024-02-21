#include "Window.h"
#include "Utils.h"
#include <iostream>

namespace
{
	void framebuffer_size_callback(GLFWwindow* window, int width, int height)
	{
		glViewport(0, 0, width, height);
	}
}

Window::Window(GLFWwindow* _window, int _default_width, int _default_height)
	: window_(_window), default_width_(_default_width), default_height_(_default_height)
{
	// make the window into the current context (show it)
	glfwMakeContextCurrent(_window);
}

void Window::toggle_fullwindow()
{
	fullwindow_ = !fullwindow_;
	if (fullwindow_) {
		auto size = GLFWUtils::get_framebuffer_size(window_);
		glViewport(0, 0, size.x, size.y);
		glfwSetFramebufferSizeCallback(window_, framebuffer_size_callback);
	}
	else {
		glViewport(0, 0, default_width_, default_height_);
		glfwSetFramebufferSizeCallback(window_, nullptr);
	}

}

void Window::set_callbacks(CallbackManager& _callback_manager)
{
	_callback_manager.register_key_callback(
		[this](GLFWwindow* _window, int _key, int _scancode, int _action, int _mods) {
			if (_key == GLFW_KEY_F && _action == GLFW_PRESS)
				toggle_fullwindow();
		}
	);
}

void Window::set_icon(const char* _icon_path)
{
	std::cout << "Setting icon: " << _icon_path << std::endl;

	int width, height, channels;
	unsigned char* icon_data = stbi_load(_icon_path, &width, &height, &channels, 4);
	GLFWimage icon[1];
	icon[0].width = width;
	icon[0].height = height;
	icon[0].pixels = icon_data;
	glfwSetWindowIcon(window_, 1, icon);
}
