#pragma once

#include "imgui.h";
#include "imgui_impl_glfw.h";
#include "imgui_impl_opengl3.h";
#include <string>
#include <memory>

#include "Properties/SliderProperty.h"

namespace UI {

	class UIPanel {
	public:
		UIPanel(std::string _name, const Shader& _shader, float _scale = 1.5f)
			: panel_name_(_name), shader_(_shader), scale_(_scale) {}

		virtual void show() {
			ImGui::PushID(panel_name_.c_str());
			ImGui::Begin(panel_name_.c_str());

			// save and load buttons
			if (ImGui::Button("Save")) {
			}
			ImGui::SameLine();
			if (ImGui::Button("Save As")) {
			}
			ImGui::SameLine();
			if (ImGui::Button("Load")) {
			}

			// init properties
			if (init_) {
				for (auto& prop : properties_)
					prop->take_effect(shader_);
				init_ = false;
			}

			// show properties and handle effects
			for (auto& prop : properties_) {
				if (prop->gui())
					prop->take_effect(shader_);
			}

			// user defined gui
			gui();

			ImGui::End();
			ImGui::PopID();
		}

		std::string get_name() { return panel_name_; }
	protected:
		virtual void gui() = 0;

		// fields
	protected:
		const Shader& shader_;
		std::string panel_name_;
		float scale_;
		bool init_ = true;
		std::vector<std::shared_ptr<Property>> properties_;
	};
}
