#include "MenuBarPanel.h"

void UI::MenuBarPanel::show()
{
	if (ImGui::BeginMainMenuBar()) {
		if (ImGui::MenuItem("Save All", "Ctrl+S")) {

		}
		if (ImGui::MenuItem("Save As", "Ctrl+Shift+S")) {

		}
		if (ImGui::MenuItem("Load")) {

		}
	}
	ImGui::EndMainMenuBar();
}

void UI::MenuBarPanel::gui()
{

}
