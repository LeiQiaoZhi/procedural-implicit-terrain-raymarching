#pragma once

#include <glm/glm.hpp>

#include "UIApp.h"
#include "ShaderClass.h"
#include "Properties/SliderProperty.h"
#include "Properties/RangeSliderProperty.h"
#include "Properties/ColorProperty.h"
#include "Properties/GroupProperty.h"
#include "Properties/BoolProperty.h"

namespace UI {

	class WaterPanel : public UIPanel {
	public:
		WaterPanel(const Shader& _shader)
			: UIPanel("Water", _shader) {
			properties_ = {

			std::make_shared<SliderI>("Water Level", "iWaterLevel", -2000, 2000, 0),
			std::make_shared<ColorProperty>("Shallow Color", "iWaterShallowColor", "#BD724F"),
			std::make_shared<ColorProperty>("Deep Color", "iWaterDeepColor", "#BD724F"),
			std::make_shared<SliderF>("Transmittance Decay", "iWaterTransmittanceDecay", 0.0, 10, 1),
			std::make_shared<SliderF>("Initial Transparency", "iWaterInitialTransparency", 0.0, 1, 1),
			std::make_shared<SliderF>("Transparency Decrease", "iWaterTransparencyDecrease", 0.0, 1, 1),
		std::make_shared<GroupProperty>("Lighting", std::vector<std::shared_ptr<Property>>{
			std::make_shared<BoolProperty>("Shadow", "iWaterShadowOn", false),
			std::make_shared<SliderF>("Fresnel F0", "iWaterFresnelNormalIncidence", 0.0f, 1.0f, 0.1f),
			std::make_shared<SliderI>("Fresnel Dot Power", "iWaterFresnelDotPower", 0, 100, 10),
			std::make_shared<SliderI>("Specular Dot Power", "iWaterSpecularDotPower", 0, 200, 10),
			std::make_shared<SliderF>("Ambient Strength", "iWaterAmbientStrength", 0.0f, 2.0f, 0.1f),
			std::make_shared<SliderF>("Diffuse Strength", "iWaterDiffuseStrength", 0.0f, 2.0f, 0.1f),
			std::make_shared<SliderF>("Specular Strength", "iWaterSpecularStrength", 0.0f, 10.0f, 0.1f),
		}),
		std::make_shared<GroupProperty>("Normal Map", std::vector<std::shared_ptr<Property>>{
			std::make_shared<SliderF2>("Offset", "iWaterOffsetDirection", std::array<float, 2>{0.1f, 0.1f}, -1, 1),
			std::make_shared<SliderF>("Horizontal Scale", "iWaterHorizontalScale", 0.1f, 1000.0f, 30.0f),
			std::make_shared<SliderF>("Max Height", "iWaterMaxHeight", 0.0f, 100.0f, 1.0f),
			std::make_shared<SliderI>("Layers", "iWaterNumLayers", 1, 40, 12),
			std::make_shared<SliderF>("Horizontal Shirnk", "iWaterHorizontalShrink", 1.0f, 4.0f, 1.9f),
			std::make_shared<SliderF>("Vertical Shrink", "iWaterVerticalShrink", 0.1f, 0.99f, 0.5f),
		}),

			};
		}
	protected:
		void gui() override {};
	};
}
