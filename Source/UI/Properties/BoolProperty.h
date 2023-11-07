#pragma once

#include <glm/glm.hpp>
#include <imgui.h>;
#include <imgui_impl_glfw.h>;
#include <imgui_impl_opengl3.h>;

#include "UI/UIUtils.h"
#include "UI/Properties/Property.h"
#include "ShaderClass.h"

namespace UI {

	class BoolProperty : public Property {
	public:
		BoolProperty(
			const std::string& _name, const std::string& _uniform_name,
			bool _value
		) : name_(_name), uniform_name_(_uniform_name), value_(_value) {}

		// float
		bool gui() {
			return ImGui::Checkbox(name_.c_str(), &value_);
		}

		void take_effect(const Shader& _shader) {
			_shader.set_uniform_bool(uniform_name_, value_);
		}

	private:
		std::string name_;
		std::string uniform_name_;
		bool value_;
	};;
}
