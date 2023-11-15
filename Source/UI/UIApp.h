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
	using PanelsList = std::vector<std::shared_ptr<UIPanel>>;

	class UIApp {
	public:
		UIApp(GLFWwindow* _window, const char* _version);
		~UIApp();

		void add_panels(const Shader& _shader, CameraController& _camera_controller);

		void show_panels();

		void set_ui_scale(float _scale);

		void set_layout(const nlohmann::json& _json);

		// json
		nlohmann::json to_json() const;
		void from_json(const nlohmann::json& _json);

		// getters
		WindowInfos get_window_infos() const { return window_infos_; }
		PanelsList get_panels() const { return panels_; }

	private:
		PanelsList panels_;
		WindowInfos window_infos_;

		nlohmann::json window_transforms_to_set_;
		bool init_window_transforms_ = false;
	};
}
