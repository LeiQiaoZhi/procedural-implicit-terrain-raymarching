#pragma once
#include <GLFW/glfw3.h>

namespace Init 
{
	void init_glfw();
	void setup_window(GLFWwindow* window, const bool resizable = true);
}