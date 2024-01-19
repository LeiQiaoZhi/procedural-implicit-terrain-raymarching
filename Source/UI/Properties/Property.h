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
		// note that the parameters are moved, it's because I always use literals as arguments
		Property(std::string_view _name, std::string_view _uniform_name)
			:name_(_name), uniform_name_(_uniform_name) {}

		virtual bool gui() = 0;
		virtual void take_effect(const Shader& _shader) = 0;
		virtual nlohmann::json to_json() const = 0;
		virtual void from_json(const nlohmann::json& _json) = 0;
		virtual void add_glsl_to_json(nlohmann::json& _json) const = 0;

		// getters
		std::string get_name() const { return std::string(name_); }

	protected:
		std::string_view name_;
		std::string_view uniform_name_;
	};;
}
