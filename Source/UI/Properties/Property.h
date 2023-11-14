#pragma once

#include <glm/glm.hpp>
#include <imgui.h>;
#include <imgui_impl_glfw.h>;
#include <imgui_impl_opengl3.h>;
#include <nlohmann/json.hpp>

#include "ShaderClass.h"

namespace UI {

	class Property {
	public:
		virtual bool gui() = 0;
		virtual void take_effect(const Shader& _shader) = 0;
		virtual nlohmann::json to_json() const = 0;
		virtual void from_json(const nlohmann::json& _json) = 0;
	};;
}
