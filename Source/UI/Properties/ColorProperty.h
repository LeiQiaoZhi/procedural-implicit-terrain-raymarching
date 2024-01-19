#pragma once

#include <glm/glm.hpp>
#include <imgui.h>;
#include <imgui_impl_glfw.h>;
#include <imgui_impl_opengl3.h>;

#include "UI/UIUtils.h"
#include "Property.h"
#include "ShaderClass.h"

namespace UI {

	class ColorProperty : public Property {
	public:
		ColorProperty(
			std::string_view _name, std::string_view _uniform_name,
			const std::string& _hex
		) : Property(_name, _uniform_name) {
			hex_to_floats(_hex, colors_);
		}

		// float
		bool gui() override {
			return ImGui::ColorEdit3(name_.data(), colors_);
		}

		void take_effect(const Shader& _shader) override {
			auto color = glm::vec3(colors_[0], colors_[1], colors_[2]);
			_shader.set_uniform_vec3(uniform_name_.data(), color);
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

		void add_glsl_to_json(nlohmann::json& _json) const override {
			std::stringstream ss;
			ss << "vec3(" << colors_[0] << ", " << colors_[1] << ", " << colors_[2] << ")";
			_json[uniform_name_.data()] = ss.str();
		}

	private:
		float colors_[3];
	};;
}
