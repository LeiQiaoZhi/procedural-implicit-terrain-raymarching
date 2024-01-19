#include "UIPanel.h"

UI::WindowInfo UI::UIPanel::show()
{
	ImGui::PushID(panel_name_.c_str());
	ImGui::Begin(panel_name_.c_str());

	save_load_buttons();

	// init and show properties and take effects
	init_properties();
	show_properties();

	// user defined gui
	gui();

	WindowInfo info;
	info.pos = ImGui::GetWindowPos();
	info.size = ImGui::GetWindowSize();

	ImGui::End();
	ImGui::PopID();

	return info;
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
		if (_json.contains(prop->get_name())) {
			prop->from_json(_json[prop->get_name()]);
			prop->take_effect(shader_);
		}
	}
}

void UI::UIPanel::add_glsl_to_json(nlohmann::json& _json) const
{
	for (auto& prop : properties_)
	{
		prop->add_glsl_to_json(_json);
	}
}

void UI::UIPanel::save_load_buttons()
{
	// save and load buttons
	if (ImGui::Button("Save")) {
		auto default_json = JsonUtils::json_from_default_config();
		default_json[panel_name_ + " Panel"] = to_json();
		JsonUtils::json_to_default_config(default_json);
	}
	ImGui::SameLine();
	if (ImGui::Button("Reset")) {
		auto default_json = JsonUtils::json_from_default_config();
		from_json(default_json[panel_name_ + " Panel"]);
	}
	ImGui::SameLine();
	if (ImGui::Button("Save As")) {
		auto path = UI::win_file_select();
		auto default_json = JsonUtils::json_from_default_config();
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
}

// init properties to shaders
void UI::UIPanel::init_properties()
{
	if (init_) {
		for (auto& prop : properties_)
			prop->take_effect(shader_);
		init_ = false;
	}
}

void UI::UIPanel::show_properties()
{
	// show properties and handle effects
	for (auto& prop : properties_) {
		ImGui::PushID(prop->get_name().c_str());
		if (prop->gui())
			prop->take_effect(shader_);
		ImGui::PopID();
	}
}
