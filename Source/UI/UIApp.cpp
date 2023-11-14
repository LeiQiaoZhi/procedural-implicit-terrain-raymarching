#include "UIApp.h"

#include "CameraPanel.h"
#include "RaymarchPanel.h"
#include "TerrainPanel.h"
#include "LightPanel.h"
#include "DomainRepPanel.h"
#include "SkyPanel.h"
#include "MenuBarPanel.h"

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
		std::move(std::make_unique<MenuBarPanel>(_shader))
	);
	panels_.push_back(
		std::move(std::make_unique<CameraPanel>(_shader, _camera_controller))
	);
	panels_.push_back(
		std::move(std::make_unique<RaymarchPanel>(_shader))
	);
	panels_.push_back(
		std::move(std::make_unique<TerrainPanel>(_shader))
	);
	panels_.push_back(
		std::move(std::make_unique<LightPanel>(_shader))
	);
	panels_.push_back(
		std::move(std::make_unique<DomainRepPanel>(_shader))
	);
	panels_.push_back(
		std::move(std::make_unique<SkyPanel>(_shader))
	);
}

void UI::UIApp::show_panels()
{
	// frame setup
	ImGui_ImplOpenGL3_NewFrame();
	ImGui_ImplGlfw_NewFrame();
	ImGui::NewFrame();

	// UI code
	for (auto& panel : panels_) {
		panel->show();
	}

	// render frame
	ImGui::Render();
	ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData());
}

void UI::UIApp::set_ui_scale(float _scale)
{
	ImGuiIO& io = ImGui::GetIO();
	io.FontGlobalScale = _scale;
}
