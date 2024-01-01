#pragma once

#include <glm/glm.hpp>

#include "UIApp.h"
#include "ShaderClass.h"
#include "UI/Properties/SliderProperty.h"
#include "UI/Properties/ColorProperty.h"
#include "UI/Properties/VecProperty.h"
#include "UI/Properties/BoolProperty.h"

namespace UI {

	class CloudPanel : public UIPanel {
	public:
		CloudPanel(const Shader& _shader)
			: UIPanel("Clouds", _shader) {
			properties_ = {
				std::make_shared<BoolProperty>("Enabled", "iEnableClouds", true),
				std::make_shared<SliderF>("Box Lower Y", "iCloudBoxLowerY", 0, 10000, 7000),
				std::make_shared<SliderF>("Box Upper Y", "iCloudBoxUpperY", 0, 10000, 8000),
				std::make_shared<SliderI>("Steps", "iCloudRaymarchSteps", 0, 1000, 10),
				std::make_shared<SliderF>("Fbm Strength", "iCloudFbmStrength", 0, 10, 0.5),
				std::make_shared<SliderF>("Strength", "iCloudStrength", 0, 10000, 0.5),
				std::make_shared<SliderF>("Min Stepsize", "iCloudMinStepSize", 0, 100, 0.5),
				std::make_shared<SliderF>("Max Ray Distance", "iCloudMaxRaymarchDist", 0, 100000, 10000),
				std::make_shared<SliderF>("Step Dist Scale", "iCloudStepDistScale", 0, 0.2 , 0.01),
				std::make_shared<SliderF>("Step Density Scale", "iCloudStepDensityScale", 0, 2 , 1),
				std::make_shared<SliderF>("Sample Alpha", "iCloudSampleAlpha", 0, 1 , 0.1),
				std::make_shared<SliderF>("Max Cum Alpha", "iCloudMaxCumAlpha", 0, 100 , 1),
				std::make_shared<SliderF>("Base Color", "iCloudBaseColor", 0, 10 , 1),
			};
		}
	protected:
		void gui() override;
	};
}
