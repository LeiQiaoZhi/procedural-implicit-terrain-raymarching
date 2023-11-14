#pragma once

#include <glm/glm.hpp>
#include <imgui.h>;
#include <imgui_impl_glfw.h>;
#include <imgui_impl_opengl3.h>;
#include <nlohmann/json.hpp>

#include "UI/UIUtils.h"
#include "UI/Properties/Property.h"
#include "ShaderClass.h"

namespace UI {

	class ColorProperty : public Property {
	public:
		ColorProperty(
			const std::string& _name, const std::string& _uniform_name,
			const std::string& _hex
		) : name_(_name), uniform_name_(_uniform_name) {
			hex_to_floats(_hex, colors_);
		}

		// float
		bool gui() override {
			return ImGui::ColorEdit3(name_.c_str(), colors_);
		}

		void take_effect(const Shader& _shader) override {
			auto color = glm::vec3(colors_[0], colors_[1], colors_[2]);
			_shader.set_uniform_vec3(uniform_name_, color);
		}

		nlohmann::json to_json() const override {
			return { { "colors", {
				colors_[0], colors_[1], colors_[2]
			} } };
		}

		void from_json(const nlohmann::json& _json) override {
			if (_json["colors"].is_array() && _json["colors"].size() == 3) {
				for (size_t i = 0; i < _json["colors"].size(); ++i) {
					colors_[i] = _json["colors"].at(i);
				}
			}
			else {
				std::cerr << "JSON does not contain a float array of size 3." << std::endl;
			}
		}

	private:
		std::string name_;
		std::string uniform_name_;
		float colors_[3];
	};;
}
