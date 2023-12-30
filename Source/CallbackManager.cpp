#include "CallbackManager.h"

CallbackManager::CallbackManager(GLFWwindow* _window)
{
	window_ = _window;

	glfwSetWindowUserPointer(window_, this);
	glfwSetKeyCallback(window_,
		[](GLFWwindow* _window, int _key, int _scancode, int _action, int _mods) {
			auto* manager = static_cast<CallbackManager*>(glfwGetWindowUserPointer(_window));
			manager->dispatch_key_callbacks(_window, _key, _scancode, _action, _mods);
		}
	);
	glfwSetScrollCallback(window_,
		[](GLFWwindow* _window, double _xoffset, double _yoffset) {
			auto* manager = static_cast<CallbackManager*>(glfwGetWindowUserPointer(_window));
			manager->dispatch_scroll_callbacks(_window, _xoffset, _yoffset);
		}
	);

}

void CallbackManager::register_key_callback(const KeyCallback& _callback)
{
	key_callbacks_.push_back(_callback);
}

void CallbackManager::dispatch_key_callbacks(GLFWwindow* _window, int _key, int _scancode, int _action, int _mods)
{
	for (auto& callback : key_callbacks_)
		callback(_window, _key, _scancode, _action, _mods);
}

void CallbackManager::register_scroll_callback(const ScrollCallback& _callback)
{
	scroll_callbacks_.push_back(_callback);
}

void CallbackManager::dispatch_scroll_callbacks(GLFWwindow* _window, double _xoffset, double _yoffset)
{
	for (auto& callback : scroll_callbacks_)
		callback(_window, _xoffset, _yoffset);
}
