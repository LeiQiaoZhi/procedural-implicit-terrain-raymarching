#pragma once

#include <glm/glm.hpp>

#include "UIApp.h"
#include "ShaderClass.h"
#include "UI/Properties/SliderProperty.h"
#include "UI/Properties/ColorProperty.h"
#include "UI/Properties/VecProperty.h"
#include "UI/Properties/BoolProperty.h"

namespace UI {

	class SkyPanel : public UIPanel {
	public:
		SkyPanel(const Shader& _shader)
			: UIPanel("Sky", _shader) {
			properties_ = {
				std::make_shared<SliderF>("Rayleigh Strength", "iRayleighStrength", 0, 10, 0),
				std::make_shared<SliderF>("Density Fall Off", "iAtmosphereDensityFallOff", 0.01, 1, 0.01),
				std::make_shared<SliderF>("Atmos Height", "iAtmosphereMaxHeight", 0, 100000, 1),
				std::make_shared<Float3>("Scattering Coefficients", "iScatteringCoefficient", std::array<float, 3>{0,0,0}),
				std::make_shared<Float3>("Fog Falloff", "iFogFallOff", std::array<float, 3>{0,0,0}),
				std::make_shared<ColorProperty>("Color Top", "iSkyColorTop", "#387EFF"),
				std::make_shared<ColorProperty>("Color Bottom", "iSkyColorBot", "#AAFFF0"),
				std::make_shared<SliderF>("Height", "iCloudHeight", 0, 50000, 10000),
				std::make_shared<SliderF>("Scale", "iCloudScale", 1000, 50000, 10000),
				std::make_shared<SliderF>("Lower Threshold", "iCloudLowerThreshold", -5, 5, 0),
				std::make_shared<SliderF>("Upper Threshold", "iCloudUpperThreshold", -5, 5, 1),
				std::make_shared<SliderF>("Fog Strength", "iSkyFogStrength", 0, 10, 0.2),
				std::make_shared<ColorProperty>("Fog Color", "iSkyFogColor", "#F9FDDA"),
			};
		}
	protected:
		void gui() override;
	};
}
