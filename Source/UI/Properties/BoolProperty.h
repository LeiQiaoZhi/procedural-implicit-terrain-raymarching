#pragma once

#include <glm/glm.hpp>
#include <imgui.h>;
#include <imgui_impl_glfw.h>;
#include <imgui_impl_opengl3.h>;
#include <nlohmann/json.hpp>

#include "UI/UIUtils.h"
#include "Property.h"
#include "ShaderClass.h"

namespace UI {

	class BoolProperty : public Property {
	public:
		BoolProperty(
			std::string_view _name, std::string_view _uniform_name,
			bool _value
		) : Property(_name, _uniform_name), value_(_value) {}

		// float
		bool gui() override {
			return ImGui::Checkbox(name_.data(), &value_);
		}

		void take_effect(const Shader& _shader) override {
			_shader.set_uniform_bool(uniform_name_.data(), value_);
		}

		nlohmann::json to_json() const override {
			return {
				{ "value", value_ }
			};
		}

		void from_json(const nlohmann::json& _json) override {
			value_ = _json.value("value", false);
		}

		void add_glsl_to_json(nlohmann::json& _json) const override {
			_json[uniform_name_.data()] = value_ ? "true" : "false";
		}

	private:
		bool value_;
	};;
}
