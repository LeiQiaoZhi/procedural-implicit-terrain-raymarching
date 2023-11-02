#pragma once

#include <glm/glm.hpp>
#include <imgui.h>;
#include <imgui_impl_glfw.h>;
#include <imgui_impl_opengl3.h>;

#include "ShaderClass.h"

namespace UI {

	class Property {
	public:
		virtual bool gui() = 0;
		virtual void set_uniform(const Shader& _shader) = 0;
	};;
}
