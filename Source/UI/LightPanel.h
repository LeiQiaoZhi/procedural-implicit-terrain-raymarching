#pragma once

#include <glm/glm.hpp>

#include "UIApp.h"
#include "ShaderClass.h"
#include "UI/Properties/VecSliderProperty.h"
#include "UI/Properties/BoolProperty.h"
#include "UI/Properties/ColorProperty.h"

namespace UI {

	class LightPanel : public UIPanel {
	public:
		LightPanel(const Shader& _shader, CameraController& _camera)
			: UIPanel("Light", _shader), camera_(_camera) {
			properties_ = {
				std::make_shared<BoolProperty>("Camera as Sun Center", "iCameraAsCenter", false),
				std::make_shared<SliderF3V>("Sun Center", "iSunCenter", 
					std::array<float, 3>{0.0f, 0.0f, 0.0f},
					-100000, 100000),
				std::make_shared<SliderF>("Theta", "iSunTheta", 0.0f, 3.14f/2.0f, 0.0f),
				std::make_shared<SliderF>("Phi", "iSunPhi", 0.0f, 2 * 3.14f, 0.0f),
				std::make_shared<SliderF>("Radius", "iSunRadius", 0.0f, 1000000.0f, 40000.0f),
				std::make_shared<BoolProperty>("Enable Sun Disk", "iEnableSunDisk", true),
				std::make_shared<SliderF>("Dot Product Threshold", "iSunDiskThreshold", 70.0f, 100.0f, 95.0f),
				std::make_shared<ColorProperty>("Sun Disk Color", "iSunDiskColor", "#ffffff"),
				std::make_shared<SliderI>("Dot Power 1", "iSunDisk1DotPower", 1, 1000, 1),
				std::make_shared<SliderF>("Strength 1", "iSunDisk1Strength", 0, 4, 1),
				std::make_shared<SliderI>("Dot Power 2", "iSunDisk2DotPower", 1, 1000, 1),
				std::make_shared<SliderF>("Strength 2", "iSunDisk2Strength", 0, 4, 1),
			};
		}
		nlohmann::json to_json() const override;
		void from_json(const nlohmann::json& _json) override;


	protected:
		void gui() override;
	private:
		void update_sun_pos();

	private:
		CameraController& camera_;
		float theta_ = 0.0f;
		float phi_ = 0.0f;
		float radius_ = 40000.0f;

	};
}
