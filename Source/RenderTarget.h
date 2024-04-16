#pragma once
#include "CallbackManager.h"

class RenderTarget {
public:
	enum class Target {
		Default,
		IDE, // Intersection Distance Error
		HDE, // Height Difference Error
		Screenshot
	};

	static RenderTarget& instance() {
		static RenderTarget instance; // Guaranteed to be destroyed and instantiated on first use
		return instance;
	}

	// Public methods to access or modify the value
	void set_render_target(Target _newValue) { target_ = _newValue; }
	Target get_render_target() const { return target_; }

	void set_callbacks(CallbackManager& _callback_manager)
	{
		_callback_manager.register_key_callback(
			[this](GLFWwindow* _window, int _key, int _scancode, int _action, int _mods) {
				if (_key == GLFW_KEY_X && _action == GLFW_PRESS)
					instance().set_render_target(Target::Screenshot);
			}
		);
	}

private:
	Target target_;

	// Private constructor and destructor
	RenderTarget() {}
	~RenderTarget() {}

	// Delete copy constructor and copy assignment operator
	RenderTarget(const RenderTarget&) = delete;
	RenderTarget& operator=(const RenderTarget&) = delete;
};
