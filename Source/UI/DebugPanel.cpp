#include "DebugPanel.h"

void UI::DebugPanel::gui()
{
	std::string selectedStr = render_target_property_->get_selected_str();

	//if (render_target_property_->get_value_changed()) {
		if (selectedStr == "Noise2D" || 
			selectedStr == "Noise3D" ||
			selectedStr == "Noise1D"
			) {
			cam_controller_.set_direction(glm::vec3(0.0f, 0.0f, 1.0f));
		}
	//}

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
	else if (selectedStr == "Noise1D") {
		if (ImGui::SliderFloat("Line Height", &line_height_, 0.0f, 0.1f))
			shader_.set_uniform_float("iDebugLineHeight", line_height_);
		if (ImGui::SliderFloat("Z", &noise1D_z_, 0.0f, 10000.0f)) 
			shader_.set_uniform_float("iDebugNoise1DZ", noise1D_z_);
	}
	else if (selectedStr == "Sphere") {
		if (ImGui::SliderFloat("Radius", &sphere_radius_, 0.0f, 10000.0f)) 
			shader_.set_uniform_float("iDebugSphereRadius", sphere_radius_);
		if (ImGui::SliderFloat("Triplanar Sharpness", &triplanar_sharpness_, 0, 20)) 
			shader_.set_uniform_int("iDebugTriplanarMappingSharpness", triplanar_sharpness_);
	}
}
