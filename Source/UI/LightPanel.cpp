#include "LightPanel.h"
#include "Utils.h"

nlohmann::json UI::LightPanel::to_json() const
{
	auto json = UI::UIPanel::to_json();
	json["theta"] = theta_;
	json["phi"] = phi_;
	json["radius"] = radius_;
	return json;

}

void UI::LightPanel::from_json(const nlohmann::json& _json)
{
	UI::UIPanel::from_json(_json);
	theta_ = _json.value("theta", theta_);
	phi_ = _json.value("phi", phi_);
	radius_ = _json.value("radius", radius_);
	update_sun_pos();
}

void UI::LightPanel::gui()
{
	//if (ImGui::InputFloat("Theta", &theta_) ||
	//	ImGui::InputFloat("Phi", &phi_) ||
	//	ImGui::InputFloat("Radius", &radius_)
	//	)
	//{
	//	// update_sun_pos();
	//}

	//if (ImGui::Button("Update Sun Pos"))
	//{
	//	update_sun_pos();
	//}

}

void UI::LightPanel::update_sun_pos()
{
	glm::vec3 cartesian = SphericalCoords::to_cartesian(theta_, phi_, radius_);
	glm::vec3 sun_pos = camera_.get_position() + cartesian;
	shader_.set_uniform_vec3("iSunPos", sun_pos);
	std::cout << "Sun pos: " << sun_pos.x << ", " << sun_pos.y << ", " << sun_pos.z << std::endl;
}
