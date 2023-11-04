#pragma once

#include <glm/glm.hpp>
#include <imgui.h>;
#include <imgui_impl_glfw.h>;
#include <imgui_impl_opengl3.h>;

#include "UIUtils.h"
#include "Property.h"
#include "ShaderClass.h"

namespace UI {

	class Float3Property : public Property {
	public:
		Float3Property(
			const std::string& _name, const std::string& _uniform_name,
			float x = 0, float y = 0, float z = 0
		) : name_(_name), uniform_name_(_uniform_name) {
			values_[0] = x;
			values_[1] = y;
			values_[2] = z;
		}

		// float
		bool gui() {
			return ImGui::InputFloat3(name_.c_str(), values_, "%.2f");
		}

		void take_effect(const Shader& _shader) {
			const auto vec3 = glm::vec3(values_[0], values_[1], values_[2]);
			_shader.set_uniform_vec3(uniform_name_, vec3);
		}

	private:
		std::string name_;
		std::string uniform_name_;
		float values_[3];
	};;
}
