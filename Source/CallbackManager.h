#pragma once
#include <functional>
#include <GLFW/glfw3.h>

class CallbackManager
{
	using KeyCallback = std::function<void(GLFWwindow*, int, int, int, int)>;
	using ScrollCallback = std::function<void(GLFWwindow*, double, double)>;

public:
	CallbackManager(GLFWwindow* _window);

	void register_key_callback(const KeyCallback& _callback);
	void register_scroll_callback(const ScrollCallback& _callback);

private:
	void dispatch_key_callbacks(GLFWwindow* _window, int _key, int _scancode, int _action, int _mods);
	void dispatch_scroll_callbacks(GLFWwindow* _window, double _xoffset, double _yoffset);

private:
	GLFWwindow* window_;
	std::vector<KeyCallback> key_callbacks_;
	std::vector<ScrollCallback> scroll_callbacks_;
};