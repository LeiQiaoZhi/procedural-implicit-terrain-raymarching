#include "MenuBarPanel.h"
#include "JsonUtils.h"
#include "UI/UIUtils.h"
#include "RenderTarget.h"

UI::WindowInfo UI::MenuBarPanel::show()
{
	if (ImGui::BeginMainMenuBar()) {

		if (ImGui::MenuItem("Save All", "Ctrl+S")) {
			JsonUtils::json_to_default_config(parent_app->to_json());
		}
		if (ImGui::MenuItem("Reset to Default")) {
			parent_app->from_json(JsonUtils::json_from_default_config());
			parent_app->set_last_loaded_config("default");
		}
		if (ImGui::MenuItem("Save As", "Ctrl+Shift+S")) {
			std::string path = UI::win_file_select();
			if (!path.empty()) {
				JsonUtils::json_to_file(parent_app->to_json(), path);
				parent_app->set_last_loaded_config(path);
			}
		}
		if (ImGui::MenuItem("Load")) {
			std::string path = UI::win_file_select();
			if (!path.empty()) {
				parent_app->from_json(JsonUtils::json_from_file(path));
				parent_app->set_last_loaded_config(path);
			}
		}
		if (ImGui::MenuItem("Substitute Uniforms")) {
			auto json = parent_app->get_glsl_json();
			auto frag_code = shader_modifiable_.substitute_uniforms(json);
			ImGui::SetClipboardText(frag_code.c_str());
			std::cout << "Code copied" << std::endl;
		}
		if (ImGui::BeginMenu("Evaluation")) {

			if (ImGui::MenuItem("Intersection Distance Error (IDE)")) {
				RenderTarget::instance().set_render_target(RenderTarget::Target::IDE);
			}
			if (ImGui::MenuItem("Height Difference Error (HDE)")) {
				RenderTarget::instance().set_render_target(RenderTarget::Target::HDE);
			}
			/*else {
				RenderTarget::instance().set_render_target(RenderTarget::Target::Default);
			}*/
			ImGui::EndMenu();
		}
		if (ImGui::MenuItem("Screenshot")) {
			RenderTarget::instance().set_render_target(RenderTarget::Target::Screenshot);
		}
		if (ImGui::BeginMenu("Viewport")) {
			ImGui::InputInt2("Viewport Size", viewport_size_);

			if (ImGui::Button("Apply")) {
				glViewport(0, 0, viewport_size_[0], viewport_size_[0]);
			}
			ImGui::EndMenu();
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
