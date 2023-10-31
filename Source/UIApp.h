#pragma once

#include "imgui.h";
#include "imgui_impl_glfw.h";
#include "imgui_impl_opengl3.h";
#include <string>
#include <vector>
#include <memory>

namespace UI {

	class UIPanel {
	public:
		UIPanel(std::string _name, float _scale = 1.5f) 
			: panel_name_(_name), scale_(_scale) {}
		void show();
	protected:
		virtual void gui() = 0;

	// fields
	protected:
		std::string panel_name_;
		float scale_;
	};

	using PanelsList = std::vector<UIPanel*>;

	void init(GLFWwindow* _window, const char* _version);
	void show_panels(const PanelsList& _panels);
	void shutdown();

	void set_ui_scale(float _scale);
}
