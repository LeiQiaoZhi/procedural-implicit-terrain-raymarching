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
				std::make_shared<SliderF>("Rayleigh Strength", "iRayleighStrength", 0, 50, 0),
				std::make_shared<SliderF>("Density Fall Off", "iAtmosphereDensityFallOff", -100, 100, 0.01,0.001),
				std::make_shared<SliderF>("Atmos Height", "iAtmosphereMaxHeight", 0, 1000000, 1),
				std::make_shared<Float3>("Scattering Coefficients", "iScatteringCoefficient", std::array<float, 3>{0,0,0}),
				std::make_shared<Float3>("Fog Falloff", "iRayleighFogFallOff", std::array<float, 3>{0,0,0}),
				std::make_shared<SliderF>("Fog Strength", "iRayleighFogStrength", 0.01, 100, 1),
				std::make_shared<SliderI>("Rayleigh Steps", "iRayleighSteps", 1, 20, 1),
				std::make_shared<SliderI>("OD Steps", "iOpticalDepthSteps", 1, 20, 1),
			};
		}
	protected:
		void gui() override;
	};
}
