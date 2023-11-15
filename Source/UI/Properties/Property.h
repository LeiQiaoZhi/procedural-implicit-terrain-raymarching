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
		Property(const std::string& _name, const std::string& _uniform_name) : name_(_name), uniform_name_(_uniform_name) {}

		// abstract 
		virtual bool gui() = 0;
		virtual void take_effect(const Shader& _shader) = 0;
		virtual nlohmann::json to_json() const = 0;
		virtual void from_json(const nlohmann::json& _json) = 0;

		// getters
		std::string get_name() const { return name_; }

	protected:
		std::string name_;
		std::string uniform_name_;
	};;
}
