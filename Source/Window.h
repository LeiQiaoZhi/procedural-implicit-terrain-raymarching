#pragma once
#include <GLFW/glfw3.h>
#include <stb/stb_image.h>
#include "CallbackManager.h"

class Window {
public:
	Window(GLFWwindow* _window, int _default_width, int _default_height);
	void toggle_fullwindow();
	void set_callbacks(CallbackManager& _callback_manager);
	void set_icon(const char* _icon_path);

private:
	GLFWwindow* window_;
	bool fullwindow_ = false;
	int default_width_, default_height_;
};