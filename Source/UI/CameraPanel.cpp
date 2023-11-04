#include "CameraPanel.h"

void UI::CameraPanel::gui()
{
	// camera settings
	ImGui::SliderFloat("Movement Speed", &camera_.settings.move_speed, 0.1f, 10.0f);
	ImGui::SliderFloat("Rotate Speed", &camera_.settings.rotate_speed, 0.1f, 10.0f);
	ImGui::SliderFloat("Zoom Speed", &camera_.settings.zoom_speed, 0.1f, 1000.0f);
	ImGui::Checkbox("Invert X", &camera_.settings.invert_x);
	ImGui::Checkbox("Invert Y", &camera_.settings.invert_y);
	ImGui::Checkbox("Invert Zoom", &camera_.settings.invert_zoom);

	// show camera information
	if (ImGui::CollapsingHeader("Transform")) {
		ImGui::InputFloat3("Position", &camera_.get_position_ref()[0], "%.0f");

		auto forward = camera_.get_forward();
		if (ImGui::InputFloat3("Forward", &forward[0], "%.2f"))
			camera_.set_direction(forward);

		print_vector("Forward", camera_.get_forward());
		print_vector("Up", camera_.get_up());
		print_vector("Right", camera_.get_right());
	}

}
