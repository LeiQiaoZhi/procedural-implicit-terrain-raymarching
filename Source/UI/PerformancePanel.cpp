#include "PerformancePanel.h"

void UI::PerformancePanel::gui()
{
	ImGui::Text(fps_str_.c_str());
	ImGui::SameLine();
	if (ImGui::Button("Copy")) {
		//ImGui::SetClipboardText(fps_str_.c_str());
		ImGui::SetClipboardText(std::to_string(frame_time_).c_str());
	}
}
