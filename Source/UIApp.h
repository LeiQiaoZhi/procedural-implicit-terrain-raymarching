#pragma once

#include "imgui.h";
#include "imgui_impl_glfw.h";
#include "imgui_impl_opengl3.h";
#include <string>

namespace UI {

	void init(GLFWwindow* window, const char* version);
	void shutdown();

	void set_ui_scale(float scale);

	class UIPanel {
	public:
		UIPanel(std::string name);
		void show();
	protected:
		virtual void gui() = 0;
		std::string panelName;
		float scale = 2.0f;
	};

}
