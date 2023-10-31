#include "UIApp.h"


void UI::init(GLFWwindow* _window, const char* _version)
{
	// ImGui setup
	IMGUI_CHECKVERSION();
	ImGui::CreateContext();
	ImGui::StyleColorsDark();
	ImGui_ImplGlfw_InitForOpenGL(_window, true);
	ImGui_ImplOpenGL3_Init(_version);
}

void UI::show_panels(const UI::PanelsList& panels)
{
	// frame setup
	ImGui_ImplOpenGL3_NewFrame();
	ImGui_ImplGlfw_NewFrame();
	ImGui::NewFrame();

	// UI code
	for (auto* panel : panels) {
		panel->show();
	}

	// render frame
	ImGui::Render();
	ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData());

}


void UI::shutdown()
{
	ImGui_ImplOpenGL3_Shutdown();
	ImGui_ImplGlfw_Shutdown();
	ImGui::DestroyContext();
}

void UI::set_ui_scale(float _scale)
{
	ImGuiIO& io = ImGui::GetIO();
	io.FontGlobalScale = _scale;
}

void UI::UIPanel::show()
{
	ImGui::PushID(panel_name_.c_str());
	ImGui::Begin(panel_name_.c_str());

	gui();
	
	ImGui::End();
	ImGui::PopID();
}
