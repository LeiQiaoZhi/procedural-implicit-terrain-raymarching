#pragma once

#include <glm/glm.hpp>
#include <imgui.h>;
#include <imgui_impl_glfw.h>;
#include <imgui_impl_opengl3.h>;
#include <nlohmann/json.hpp>

#include "UI/UIUtils.h"
#include "Property.h"

namespace UI {

	class LabelProperty : public Property {
	public:
		LabelProperty(
			std::string_view _label
		) : Property(_label, ""), label_(_label) {}

		// float
		bool gui() override {
			ImGui::Text(label_.data());
			return true;
		}

		void take_effect(const Shader& _shader) override {
		}

		nlohmann::json to_json() const override {
			return {
			};
		}

		void from_json(const nlohmann::json& _json) override {
		}

	private:
		std::string_view label_;
	};;
}
