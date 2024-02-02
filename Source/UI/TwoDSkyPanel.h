#pragma once

#include <glm/glm.hpp>

#include "UIApp.h"
#include "ShaderClass.h"
#include "UI/Properties/SliderProperty.h"
#include "UI/Properties/ColorProperty.h"
#include "UI/Properties/VecProperty.h"
#include "UI/Properties/BoolProperty.h"

namespace UI {

	class TwoDSkyPanel : public UIPanel {
	public:
		TwoDSkyPanel(const Shader& _shader)
			: UIPanel("2D Sky", _shader) {
			properties_ = {
				std::make_shared<BoolProperty>("Used 2D Sky", "iSkyUse2D", false),
				std::make_shared<BoolProperty>("Used 2D Clouds", "iUse2DClouds", false),
				std::make_shared<ColorProperty>("Color Top", "iSkyColorTop", "#387EFF"),
				std::make_shared<ColorProperty>("Color Bottom", "iSkyColorBot", "#AAFFF0"),
				std::make_shared<SliderF>("Height", "iCloudHeight", 0, 50000, 10000),
				std::make_shared<SliderF>("Scale", "iCloudScale", 1000, 50000, 10000),
				std::make_shared<SliderF>("Lower Threshold", "iCloudLowerThreshold", -5, 5, 0),
				std::make_shared<SliderF>("Upper Threshold", "iCloudUpperThreshold", -5, 5, 1),
				std::make_shared<SliderF>("Sky Fog Strength", "iSkyFogStrength", 0, 10, 0.2),
				std::make_shared<ColorProperty>("Sky Fog Color", "iSkyFogColor", "#F9FDDA"),
				std::make_shared<SliderF>("Fog Strength", "iFogStrength", 0.0f, 10.0f, 0.0f),
				std::make_shared<ColorProperty>("Fog Color", "iFogColor", "#8C8E91"),
			};
		}
	protected:
		void gui() override {};
	};
}
