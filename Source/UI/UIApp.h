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
#include "CallbackManager.h"
#include "PerformancePanel.h"

namespace UI {
	using PanelsList = std::vector<std::shared_ptr<UIPanel>>;

	class UIApp {
	public:
		UIApp(GLFWwindow* _window, const char* _version);
		~UIApp();

		void add_panels(Shader& _shader, CameraController& _camera_controller);

		// called once
		void set_callbacks(CallbackManager& _callback_manager);
		// called every frame
		void handle_inputs();

		void show_panels();

		void set_ui_scale(float _scale);

		void set_layout(const nlohmann::json& _json);

		// json
		nlohmann::json to_json() const;
		void from_json(const nlohmann::json& _json);
		nlohmann::json get_glsl_json() const;

		// getters
		WindowInfos get_window_infos() const { return window_infos_; }
		PanelsList get_panels() const { return panels_; }
		std::shared_ptr<PerformancePanel> get_performance_panel() const { return performance_panel_; }
		std::string get_last_loaded_config() const { return last_loaded_config_; }

		// setters
		void toggle_hide_ui() { hide_ui_ = !hide_ui_; }
		void set_last_loaded_config(const std::string& _last_loaded_config) { 
			std::string filename = JsonUtils::remove_json_extension(_last_loaded_config);
			size_t pos = filename.find_last_of('\\');

			if (pos != std::string::npos) {
				std::string lastPart = filename.substr(pos + 1);
				last_loaded_config_ = lastPart;
			}
			else 
				last_loaded_config_ = filename;

			std::cout << "last_loaded_config_ : " << last_loaded_config_ << std::endl;
		}


	private:
		GLFWwindow* window_;
		PanelsList panels_;
		WindowInfos window_infos_;

		nlohmann::json window_transforms_to_set_;
		bool init_window_transforms_ = false;
		bool hide_ui_ = false;

		std::shared_ptr<PerformancePanel> performance_panel_;

	public:
		std::string last_loaded_config_ = "default";
	};
}
