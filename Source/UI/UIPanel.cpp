#include "UIPanel.h"

void UI::UIPanel::show()
{
	ImGui::PushID(panel_name_.c_str());
	ImGui::Begin(panel_name_.c_str());

	// save and load buttons
	if (ImGui::Button("Save")) {
		auto default_json = JsonUtils::json_from_default();
		default_json[panel_name_ + " Panel"] = to_json();
		JsonUtils::json_to_default(default_json);
	}
	ImGui::SameLine();
	if (ImGui::Button("Reset")) {
		auto default_json = JsonUtils::json_from_default();
		from_json(default_json[panel_name_ + " Panel"]);
	}
	ImGui::SameLine();
	if (ImGui::Button("Save As")) {
		auto path = UI::win_file_select();
		auto default_json = JsonUtils::json_from_default();
		default_json[panel_name_ + " Panel"] = to_json();
		if (!path.empty())
			JsonUtils::json_to_file(default_json, path);
	}
	ImGui::SameLine();
	if (ImGui::Button("Load")) {
		auto path = UI::win_file_select();
		if (!path.empty()) {
			auto json = JsonUtils::json_from_file(path);
			from_json(json[panel_name_ + " Panel"]);
		}
	}

	// init properties
	if (init_) {
		for (auto& prop : properties_)
			prop->take_effect(shader_);
		init_ = false;
	}

	// show properties and handle effects
	for (auto& prop : properties_) {
		if (prop->gui())
			prop->take_effect(shader_);
	}

	// user defined gui
	gui();

	ImGui::End();
	ImGui::PopID();
}

nlohmann::json UI::UIPanel::to_json() const
{
	nlohmann::json j;
	for (auto& prop : properties_)
	{
		j[prop->get_name()] = prop->to_json();
	}
	return j;
}

void UI::UIPanel::from_json(const nlohmann::json& _json)
{
	for (auto& prop : properties_)
	{
		prop->from_json(_json[prop->get_name()]);
		prop->take_effect(shader_);
	}
}
