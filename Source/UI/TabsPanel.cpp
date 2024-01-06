#include "TabsPanel.h"

// { "This Panel: { "Tab": { "Property": "Value" } } }
nlohmann::json UI::TabsPanel::to_json() const
{
	nlohmann::json j;
	for (auto& panel : panels_list_)
	{
		j[panel->get_name() + " Tab"] = panel->to_json();
	}
	return j;
}

void UI::TabsPanel::from_json(const nlohmann::json& _json)
{
	for (auto& panel : panels_list_)
	{
		if (_json.contains(panel->get_name() + " Tab"))
			panel->from_json(_json[panel->get_name() + " Tab"]);
	}
}

void UI::TabsPanel::save_load_buttons()
{
	// don't show, leave it for individual panels
}

void UI::TabsPanel::gui()
{
	if (ImGui::BeginTabBar("Tabs"))
	{
		for (auto& panel : panels_list_)
		{
			if (ImGui::BeginTabItem(panel->get_name().c_str()))
			{
				panel_save_load_buttons(*panel);
				panel->show_properties();

				panel->gui();
				ImGui::EndTabItem();
			}
		}
		ImGui::EndTabBar();
	}
}

void UI::TabsPanel::init_properties()
{
	if (init_) {
		for (auto& panel : panels_list_)
			panel->init_properties();
		init_ = false;
	}
}

void UI::TabsPanel::panel_save_load_buttons(UIPanel& _panel)
{
	if (ImGui::Button("Save")) {
		auto default_json = JsonUtils::json_from_default_config();
		default_json[panel_name_ + " Panel"][_panel.get_name() + " Tab"] = _panel.to_json();
		JsonUtils::json_to_default_config(default_json);
	}
	ImGui::SameLine();
	if (ImGui::Button("Reset")) {
		auto default_json = JsonUtils::json_from_default_config();
		_panel.from_json(default_json[panel_name_ + " Panel"][_panel.get_name() + " Tab"]);
	}
	ImGui::SameLine();
	if (ImGui::Button("Save As")) {
		auto path = UI::win_file_select();
		auto default_json = JsonUtils::json_from_default_config();
		default_json[panel_name_ + " Panel"][_panel.get_name() + " Tab"] = _panel.to_json();
		if (!path.empty())
			JsonUtils::json_to_file(default_json, path);
	}
	ImGui::SameLine();
	if (ImGui::Button("Load")) {
		auto path = UI::win_file_select();
		if (!path.empty()) {
			auto json = JsonUtils::json_from_file(path);
			_panel.from_json(json[panel_name_ + " Panel"][_panel.get_name() + " Tab"]);
		}
	}
}
