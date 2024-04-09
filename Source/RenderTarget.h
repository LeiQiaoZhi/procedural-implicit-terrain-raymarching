#pragma once
#include <glad/glad.h>

class RenderTarget {
public:
	enum class Target {
		Default,
		IDE, // Intersection Distance Error
		HDE, // Height Difference Error
	};

	static RenderTarget& instance() {
		static RenderTarget instance; // Guaranteed to be destroyed and instantiated on first use
		return instance;
	}

	// Public methods to access or modify the value
	void set_render_target(Target _newValue) { target_ = _newValue; }
	Target get_render_target() const { return target_; }

private:
	Target target_;

	// Private constructor and destructor
	RenderTarget() {}
	~RenderTarget() {}

	// Delete copy constructor and copy assignment operator
	RenderTarget(const RenderTarget&) = delete;
	RenderTarget& operator=(const RenderTarget&) = delete;
};
