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

	class GroupProperty : public Property {
	public:
		// note _properties is a rvalue reference, can pass vectors created on the fly {...}
		GroupProperty(
			std::string_view _name, std::vector<std::shared_ptr<Property>>&& _properties
		) : Property(_name, ""), properties_(std::move(_properties)) {}

		// float
		bool gui() override {
			bool value_changed = false;
			if (ImGui::CollapsingHeader(name_.data())) {
				for (auto& property : properties_) {
					value_changed |= property->gui();
				}
			}
			return value_changed;
		}

		void take_effect(const Shader& _shader) override {
			for (auto& property : properties_) {
				property->take_effect(_shader);
			}
		}

		nlohmann::json to_json() const override {
			nlohmann::json j;
			for (auto& property : properties_) {
				j[property->get_name()] = property->to_json();
			}
			return j;
		}

		void from_json(const nlohmann::json& _json) override {
			for (auto& property : properties_) {
				if (_json.contains(property->get_name())) 
					property->from_json(_json[property->get_name()]);
			}
		}

		void add_glsl_to_json(nlohmann::json& _json) const override {
			for (auto& property : properties_) {
				property->add_glsl_to_json(_json);
			}
		}

	private:
		std::vector<std::shared_ptr<Property>> properties_;
	};
}
