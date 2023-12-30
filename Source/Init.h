#pragma once
#include <GLFW/glfw3.h>

namespace Init 
{
	void init_glfw();
	void setup_window(GLFWwindow* _window);
	void set_window_fullscreen(GLFWwindow* _window, bool _fullscreen);
}