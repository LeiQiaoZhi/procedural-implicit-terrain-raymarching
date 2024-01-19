#include "UIApp.h"
#include "UIUtils.h"

#include "CameraPanel.h"
#include "RaymarchPanel.h"
#include "TerrainPanel.h"
#include "LightPanel.h"
#include "DomainRepPanel.h"
#include "SkyPanel.h"
#include "DebugPanel.h"
#include "CloudPanel.h"
#include "TwoDSkyPanel.h"
#include "MenuBarPanel.h"
#include "TabsPanel.h"
#include "JsonUtils.h"

UI::UIApp::UIApp(GLFWwindow* _window, const char* _version)
{
	window_ = _window;
	// ImGui setup
	IMGUI_CHECKVERSION();
	ImGui::CreateContext();
	ImGui::StyleColorsDark();
	ImGui_ImplGlfw_InitForOpenGL(_window, true);
	ImGui_ImplOpenGL3_Init(_version);

	// Styles
	auto& accent = hex_to_imvec4("#3A7698");
	auto& gray = ImVec4(0.2f, 0.2f, 0.2f, 1.0f);
	auto& black = ImVec4(0.0f, 0.0f, 0.0f, 1.0f);

	ImGuiStyle& style = ImGui::GetStyle();
	style.Colors[ImGuiCol_Border] = ImVec4(1.0f, 1.0f, 1.0f, 0.4f);
	style.Colors[ImGuiCol_WindowBg] = black;
	style.Colors[ImGuiCol_TitleBgActive] = accent;
	style.Colors[ImGuiCol_FrameBgActive] = accent;
	style.Colors[ImGuiCol_TabActive] = accent;
	style.Colors[ImGuiCol_Tab] = gray;
	style.Colors[ImGuiCol_Header] = ImVec4(1.0f, 1.0f, 1.0f, 0.14f);

}

UI::UIApp::~UIApp()
{
	ImGui_ImplOpenGL3_Shutdown();
	ImGui_ImplGlfw_Shutdown();
	ImGui::DestroyContext();
}

void UI::UIApp::add_panels(const Shader& _shader, CameraController& _camera_controller)
{
	panels_.clear();
	panels_.push_back(
		std::move(std::make_shared<MenuBarPanel>(_shader, this))
	);

	performance_panel_ = std::make_shared<PerformancePanel>(_shader);

	panels_.push_back(std::make_shared<TabsPanel>("Short 3", _shader,
		PanelsList{
			performance_panel_,
			std::make_shared<DebugPanel>(_shader),
		})
	);

	panels_.push_back(std::move(std::make_shared<TabsPanel>("Short 1", _shader,
		PanelsList{
			std::make_shared<CameraPanel>(_shader, _camera_controller),
			std::make_shared<RaymarchPanel>(_shader)
		}))
	);

	panels_.push_back(std::move(std::make_shared<TabsPanel>("Short 2", _shader,
		PanelsList{
			std::make_shared<LightPanel>(_shader, _camera_controller),
			std::make_shared<TwoDSkyPanel>(_shader)
		}))
	);

	panels_.push_back(std::move(std::make_shared<TabsPanel>("Long 1", _shader,
		PanelsList{
			std::make_shared<TerrainPanel>(_shader),
			std::make_shared<DomainRepPanel>(_shader),
			std::make_shared<SkyPanel>(_shader),
			std::make_shared<CloudPanel>(_shader)
		}))
	);

	// load default values
	auto default_json = JsonUtils::json_from_default_config();
	from_json(default_json);
	// load default window layout
	auto default_layout = JsonUtils::json_from_default_layout();
	set_layout(default_layout);
}

void UI::UIApp::set_callbacks(CallbackManager& _callback_manager)
{
	_callback_manager.register_key_callback(
		[this](GLFWwindow* _window, int _key, int _scancode, int _action, int _mods) {
			if (_key == GLFW_KEY_SPACE && _action == GLFW_PRESS)
				hide_ui_ = !hide_ui_;
		}
	);
}

void UI::UIApp::handle_inputs()
{
}

void UI::UIApp::show_panels()
{
	if (hide_ui_) return;

	// frame setup
	ImGui_ImplOpenGL3_NewFrame();
	ImGui_ImplGlfw_NewFrame();
	ImGui::NewFrame();

	// UI code
	std::vector<WindowInfo> window_infos;
	for (auto& panel : panels_) {
		// set window size and position
		auto key = panel->get_name() + " Panel";
		if (init_window_transforms_ && window_transforms_to_set_.contains(key)) {
			auto& transform = window_transforms_to_set_[key];
			ImGui::SetNextWindowSize(JsonUtils::json_array_to_imvec2(transform["size"]));
			ImGui::SetNextWindowPos(JsonUtils::json_array_to_imvec2(transform["pos"]));
		}
		// show window
		auto& window_info = panel->show();
		window_infos.push_back(window_info);
	}
	window_infos_ = window_infos;

	if (init_window_transforms_)
		init_window_transforms_ = false;

	// render frame
	ImGui::Render();
	ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData());
}

void UI::UIApp::set_ui_scale(float _scale)
{
	ImGuiIO& io = ImGui::GetIO();
	io.FontGlobalScale = _scale;
}

void UI::UIApp::set_layout(const nlohmann::json& _json)
{
	window_transforms_to_set_ = _json;
	init_window_transforms_ = true;
}

nlohmann::json UI::UIApp::to_json() const
{
	nlohmann::json j;
	for (auto& panel : panels_) {
		j[panel->get_name() + " Panel"] = panel->to_json();
	}
	return j;
}

void UI::UIApp::from_json(const nlohmann::json& _json)
{
	for (auto& panel : panels_) {
		auto key_name = panel->get_name() + " Panel";
		if (_json.contains(key_name))
			panel->from_json(_json[key_name]);
	}
}

nlohmann::json UI::UIApp::get_glsl_json() const
{
	nlohmann::json json;
	for (auto& panel : panels_) {
		panel->add_glsl_to_json(json);
	}
	return json;
}
