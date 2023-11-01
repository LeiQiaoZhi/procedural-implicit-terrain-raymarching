#include "DebugPanel.h"

void UI::DebugPanel::gui() 
{
	if (init_) {
		UI::set_ui_scale(scale_);
		shader_.set_uniform_int("iShadowSteps", shadow_steps_);
		shader_.set_uniform_int("iMaxSteps", max_steps_);
		shader_.set_uniform_float("iStepSize", step_size_);
		shader_.set_uniform_float("iFocalLength", focal_length_);
		shader_.set_uniform_float("iFogStrength", fog_strength_);
		shader_.set_uniform_float("iGrassThreshold", grass_threshold_);
		shader_.set_uniform_float("iDirtThreshold", dirt_threshold_);
		init_ = false;
	}

	if (ImGui::SliderFloat("UI Scale", &scale_, 0.5f, 5.0f))
		UI::set_ui_scale(scale_);

	if (ImGui::SliderInt("Shadow Steps", &shadow_steps_, 0, 128))
		shader_.set_uniform_int("iShadowSteps", shadow_steps_);

	if (ImGui::SliderInt("Max Steps", &max_steps_, 0, 2000))
		shader_.set_uniform_int("iMaxSteps", max_steps_);

	if (ImGui::SliderFloat("Step Size", &step_size_, 0.1f, 100.0f))
		shader_.set_uniform_float("iStepSize", step_size_);

	if (ImGui::SliderFloat("Focal Length", &focal_length_, 0.1f, 100.0f))
		shader_.set_uniform_float("iFocalLength", focal_length_);

	if (ImGui::SliderFloat("Fog Strength", &fog_strength_, 0.0f, 10.0f))
		shader_.set_uniform_float("iFogStrength", fog_strength_);

	if (ImGui::SliderFloat("Grass Threshold", &grass_threshold_, 0.0f, 1.0f))
		shader_.set_uniform_float("iGrassThreshold", grass_threshold_);

	if (ImGui::SliderFloat("Dirt Threshold", &dirt_threshold_, 0.0f, 1.0f))
		shader_.set_uniform_float("iDirtThreshold", dirt_threshold_);

	float grass_color[3] = { grass_color_.x, grass_color_.y, grass_color_.z };
	if (ImGui::ColorPicker3("Grass Color", grass_color)) {
		grass_color_ = glm::vec3(grass_color[0], grass_color[1], grass_color[2]);
		shader_.set_uniform_vec3("iGrassColor", grass_color_);
	}


}
