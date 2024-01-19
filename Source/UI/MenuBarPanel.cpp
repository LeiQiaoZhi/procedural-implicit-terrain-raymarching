#include "MenuBarPanel.h"
#include "JsonUtils.h"
#include "UI/UIUtils.h"

UI::WindowInfo UI::MenuBarPanel::show()
{
	if (ImGui::BeginMainMenuBar()) {

		if (ImGui::MenuItem("Save All", "Ctrl+S")) {
			//std::cout << parent_app->to_json().dump(4) << std::endl;
			JsonUtils::json_to_default_config(parent_app->to_json());
		}
		if (ImGui::MenuItem("Reset to Default")) {
			parent_app->from_json(JsonUtils::json_from_default_config());
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
		if (ImGui::MenuItem("Substitute Uniforms")) {
			auto json = parent_app->get_glsl_json();
			shader_modifiable_.substitute_uniforms(json);
		}

		if (ImGui::BeginMenu("Layouts")) {

			if (ImGui::MenuItem("Save")) {
				auto window_infos = parent_app->get_window_infos();
				auto panels = parent_app->get_panels();
				nlohmann::json layout_json;
				for (size_t i = 0; i < window_infos.size(); i++) {
					layout_json[panels[i]->get_name() + " Panel"] = {
						{"pos", JsonUtils::imvec2_to_json_array(window_infos[i].pos)},
						{"size", JsonUtils::imvec2_to_json_array(window_infos[i].size)}
					};
				}
				JsonUtils::json_to_default_layout(layout_json);
			}

			if (ImGui::MenuItem("Reset")) {
				auto default_layout = JsonUtils::json_from_default_layout();
				parent_app->set_layout(default_layout);
			}
			ImGui::EndMenu();
		}
		ImGui::EndMainMenuBar();
	}

	WindowInfo info;
	info.pos = ImGui::GetWindowPos();
	info.size = ImGui::GetWindowSize();
	return info;
}

void UI::MenuBarPanel::gui()
{

}
