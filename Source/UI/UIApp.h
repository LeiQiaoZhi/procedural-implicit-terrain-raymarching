#pragma once

#include <imgui.h>;
#include <imgui_impl_glfw.h>;
#include <imgui_impl_opengl3.h>;
#include <string>
#include <vector>
#include <memory>

#include "UIPanel.h"
#include "Camera/CameraController.h"
#include "ShaderClass.h"

namespace UI {
	using PanelsList = std::vector<std::unique_ptr<UIPanel>>;

	class UIApp {
	public:
		UIApp(GLFWwindow* _window, const char* _version);
		~UIApp();

		void add_panels(const Shader& _shader, CameraController& _camera_controller);

		void show_panels();

		void set_ui_scale(float _scale);

	private:
		PanelsList panels_;
	};
}
