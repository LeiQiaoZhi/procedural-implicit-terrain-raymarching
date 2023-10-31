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


void UI::shutdown()
{
	ImGui_ImplOpenGL3_Shutdown();
	ImGui_ImplGlfw_Shutdown();
	ImGui::DestroyContext();
}

UI::UIPanel::UIPanel(std::string _name)
{
	panelName = _name;
	set_ui_scale(scale);
}

void UI::set_ui_scale(float _scale)
{
	ImGuiIO& io = ImGui::GetIO();
	io.FontGlobalScale = _scale;
}

void UI::UIPanel::show()
{
	// frame setup
	ImGui_ImplOpenGL3_NewFrame();
	ImGui_ImplGlfw_NewFrame();
	ImGui::NewFrame();

	// UI code
	ImGui::Begin(panelName.c_str());
	gui();
	ImGui::End();

	// render frame
	ImGui::Render();
	ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData());

}
