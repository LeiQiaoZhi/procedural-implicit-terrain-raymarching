#include "DebugPanel.h"

void UI::DebugPanel::gui()
{
	float grass_color[3] = { grass_color_.x, grass_color_.y, grass_color_.z };
	if (ImGui::ColorPicker3("Grass Color", grass_color)) {
		grass_color_ = glm::vec3(grass_color[0], grass_color[1], grass_color[2]);
		shader_.set_uniform_vec3("iGrassColor", grass_color_);
	}
}
