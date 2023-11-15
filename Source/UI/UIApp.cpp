#include "UIApp.h"

#include "CameraPanel.h"
#include "RaymarchPanel.h"
#include "TerrainPanel.h"
#include "LightPanel.h"
#include "DomainRepPanel.h"
#include "SkyPanel.h"
#include "MenuBarPanel.h"
#include "JsonUtils.h"

UI::UIApp::UIApp(GLFWwindow* _window, const char* _version)
{
	// ImGui setup
	IMGUI_CHECKVERSION();
	ImGui::CreateContext();
	ImGui::StyleColorsDark();
	ImGui_ImplGlfw_InitForOpenGL(_window, true);
	ImGui_ImplOpenGL3_Init(_version);
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
	panels_.push_back(
		std::move(std::make_shared<CameraPanel>(_shader, _camera_controller))
	);
	panels_.push_back(
		std::move(std::make_shared<RaymarchPanel>(_shader))
	);
	panels_.push_back(
		std::move(std::make_shared<TerrainPanel>(_shader))
	);
	panels_.push_back(
		std::move(std::make_shared<LightPanel>(_shader))
	);
	panels_.push_back(
		std::move(std::make_shared<DomainRepPanel>(_shader))
	);
	panels_.push_back(
		std::move(std::make_shared<SkyPanel>(_shader))
	);

	// load default values
	auto default_json = JsonUtils::json_from_default_config();
	from_json(default_json);
	// load default window layout
	auto default_layout = JsonUtils::json_from_default_layout();
	set_layout(default_layout);
}

void UI::UIApp::show_panels()
{
	// frame setup
	ImGui_ImplOpenGL3_NewFrame();
	ImGui_ImplGlfw_NewFrame();
	ImGui::NewFrame();

	// UI code
	std::vector<WindowInfo> window_infos;
	for (auto& panel : panels_) {
		// set window size and position
		if (init_window_transforms_) {
			auto& transform = window_transforms_to_set_[panel->get_name() + " Panel"];
			ImGui::SetNextWindowSize(JsonUtils::json_array_to_imvec2(transform["size"]));
			ImGui::SetNextWindowPos(JsonUtils::json_array_to_imvec2(transform["pos"]));
		}
		// show window
		window_infos.push_back(panel->show());
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
		j[panel->get_name()+" Panel"] = panel->to_json();
	}
	return j;
}

void UI::UIApp::from_json(const nlohmann::json& _json)
{
	for (auto& panel : panels_) {
		panel->from_json(_json[panel->get_name()+" Panel"]);
	}
}
