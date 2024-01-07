#include "CameraPanel.h"

void UI::CameraPanel::gui()
{
	// camera settings
	focal_length = camera_.get_focal_length();
	if (ImGui::SliderFloat("Focal Length", &focal_length, 0.1f, 100.0f))
		camera_.set_focal_length(focal_length);
	ImGui::SliderFloat("Movement Speed", &camera_.settings.move_speed, 0.1f, 1000.0f);
	ImGui::SliderFloat("Keyboard Speed", &camera_.settings.keyboard_speed, 0.1f, 1000.0f);
	ImGui::SliderFloat("Rotate Speed", &camera_.settings.rotate_speed, 0.1f, 10.0f);
	ImGui::SliderFloat("Zoom Speed", &camera_.settings.zoom_speed, 0.1f, 10.0f);
	ImGui::Checkbox("Invert X", &camera_.settings.invert_x);
	ImGui::Checkbox("Invert Y", &camera_.settings.invert_y);
	ImGui::Checkbox("Invert Zoom", &camera_.settings.invert_zoom);

	// show camera information
	if (ImGui::TreeNodeEx("Transform", ImGuiTreeNodeFlags_DefaultOpen)) {
		ImGui::InputFloat3("Position", &camera_.get_position_ref()[0], "%.0f");

		auto forward = camera_.get_forward();
		if (ImGui::InputFloat3("Forward", &forward[0], "%.2f"))
			camera_.set_direction(forward);

		print_vector("Forward", camera_.get_forward());
		print_vector("Up", camera_.get_up());
		print_vector("Right", camera_.get_right());

		ImGui::TreePop();
	}

}

nlohmann::json UI::CameraPanel::to_json() const
{
	nlohmann::json j = UIPanel::to_json();
	j["camera_settings"] = camera_.settings.to_json();
	j["camara_transform"] = camera_.get_transform_json();
	return j;
}

void UI::CameraPanel::from_json(const nlohmann::json& _json)
{
	UIPanel::from_json(_json);
	camera_.settings.from_json(_json["camera_settings"]);
	camera_.set_transform_json(_json["camara_transform"]);
}
