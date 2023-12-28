#include "DebugPanel.h"

void UI::DebugPanel::gui()
{
	std::string selectedStr = render_target_property_->get_selected_str();

	if (selectedStr == "Noise3D") {
		if (ImGui::SliderFloat("Z", &noise3D_z_, 0.0f, 10000.0f)) 
			shader_.set_uniform_float("iDebugNoise3DZ", noise3D_z_);
	}
	else if (selectedStr == "Depth") {
		if (ImGui::SliderFloat("Max Distance", &max_distance_, 0.1f, 1000000.0f)) 
			shader_.set_uniform_float("iDebugMaxRayDistance", max_distance_);
		if (ImGui::Checkbox("Mark Not In Atmosphere", &mark_not_in_atmosphere)) 
			shader_.set_uniform_bool("iDebugMarkNotInAtmosphere", mark_not_in_atmosphere);
	}
}
