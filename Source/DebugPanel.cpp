#include "DebugPanel.h"

void UI::DebugPanel::gui() 
{
	if (init_) {
		shader_.set_uniform_int("iShadowSteps", shadow_steps_);
		init_ = false;
	}

	if (ImGui::SliderFloat("UI Scale", &scale, 0.5f, 5.0f)){
		UI::set_ui_scale(scale);
	}

	if (ImGui::SliderInt("Shadow Steps", &shadow_steps_, 0, 128)) {
		shader_.set_uniform_int("iShadowSteps", shadow_steps_);
	}
}
