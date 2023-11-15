#include "MenuBarPanel.h"
#include "JsonUtils.h"
#include "UI/UIUtils.h"

void UI::MenuBarPanel::show()
{
	if (ImGui::BeginMainMenuBar()) {
		if (ImGui::MenuItem("Save All", "Ctrl+S")) {
			//std::cout << parent_app->to_json().dump(4) << std::endl;
			JsonUtils::json_to_default(parent_app->to_json());
		}
		if (ImGui::MenuItem("Reset to Default")) {
			parent_app->from_json(JsonUtils::json_from_default());
		}
		if (ImGui::MenuItem("Save As", "Ctrl+Shift+S")) {
			std::string path = UI::win_file_select();
			if (!path.empty())
				JsonUtils::json_to_file(parent_app->to_json(), path);
		}
		if (ImGui::MenuItem("Load")) {
			std::string path = UI::win_file_select();
			//std::cout << JsonUtils::json_from_file(path).dump(4) << std::endl;
			if (!path.empty())
				parent_app->from_json(JsonUtils::json_from_file(path));
		}
	}
	ImGui::EndMainMenuBar();
}

void UI::MenuBarPanel::gui()
{

}
