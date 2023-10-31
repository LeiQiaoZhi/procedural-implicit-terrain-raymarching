#include "DebugPanel.h"

void UI::DebugPanel::gui() 
{
	if (init_) {
		UI::set_ui_scale(scale_);
		shader_.set_uniform_int("iShadowSteps", shadow_steps_);
		shader_.set_uniform_int("iMaxSteps", max_steps_);
		shader_.set_uniform_float("iStepSize", step_size_);
		shader_.set_uniform_float("iFocalLength", focal_length_);
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
}
