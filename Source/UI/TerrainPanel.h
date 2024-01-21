#pragma once

#include <glm/glm.hpp>

#include "UIApp.h"
#include "ShaderClass.h"
#include "Properties/SliderProperty.h"
#include "Properties/RangeSliderProperty.h"
#include "Properties/ColorProperty.h"
#include "Properties/GroupProperty.h"

namespace UI {

	class TerrainPanel : public UIPanel {
	public:
		TerrainPanel(const Shader& _shader)
			: UIPanel("Terrain", _shader) {
			properties_ = {
			std::make_shared<SliderF>("Horizontal Scale", "iHorizontalScale", 0.1f, 10000.0f, 3000.0f),
			std::make_shared<SliderF>("Max Height", "iMaxHeight", 0.0f, 10000.0f, 1200.0f),
			std::make_shared<SliderI>("Layers", "iNumLayers", 1, 40, 12),
			std::make_shared<SliderI>("Normal Layers", "iNormalNumLayers", 1, 40, 12),
			std::make_shared<RangeSliderI>("Band Pass (Layers to Filter Out)", "iFilterRange", 1, 20, 1, 1),
			std::make_shared<SliderF>("Horizontal Shirnk", "iHorizontalShrink", 1.0f, 4.0f, 1.9f),
			std::make_shared<SliderF>("Vertical Shrink", "iVerticalShrink", 0.1f, 0.99f, 0.5f),
			std::make_shared<SliderF>("Starting Vertical Shrink", "iVerticalShrinkStart", 0.1f, 20.0f, 0.5f),
			std::make_shared<SliderF>("Grass Threshold", "iGrassThreshold", 0.0f, 1.0f, 0.9f),
			std::make_shared<SliderF>("Dirt Threshold", "iDirtThreshold", 0.0f, 1.0f, 0.95f),
			std::make_shared<ColorProperty>("Grass Color", "iGrassColor", "#5A9123"),
			std::make_shared<GroupProperty>("Rock Texture", std::vector<std::shared_ptr<Property>>{
				std::make_shared<ColorProperty>("Dirt Color", "iDirtColor", "#BD724F"),
				std::make_shared<ColorProperty>("Stripe Color 1", "iRockColor1", "#BD724F"),
				std::make_shared<ColorProperty>("Stripe Color 2", "iRockColor2", "#BD724F"),
				std::make_shared<SliderF>("Stripe Horizontal Scale", "iRockStripeHorizontalScale", 0.0f, 10.0f, 0.95f),
				std::make_shared<SliderF>("Stripe Vertical Scale", "iRockStripeVerticalScale", 0.0f, 10.0f, 0.95f),
				std::make_shared<SliderF>("XZ Noise Scale", "iRockXZNoiseScale", 0.0f, 100.0f, 0.95f),
				std::make_shared<SliderF>("XZ Noise Strength", "iRockXZNoiseStrength", 0.0f, 1.0f, 0.95f),
				std::make_shared<SliderF>("XZ Noise Base", "iRockXZNoiseBase", 0.0f, 1.0f, 0.95f),
				std::make_shared<ColorProperty>("Hide Stripe Color", "iRockHideStripeColor", "#BD724F"),
				std::make_shared<SliderF>("Hide Stripe Normal Lower", "iRockHideStripeNormalLower", 0.0f, 1.0f, 0.95f),
				std::make_shared<SliderF>("Hide Stripe Normal Upper", "iRockHideStripeNormalUpper", 0.0f, 1.0f, 0.95f),
			}),
			std::make_shared<GroupProperty>("Lighting", std::vector<std::shared_ptr<Property>>{
				std::make_shared<SliderF>("Fresnel F0", "iFresnelNormalIncidence", 0.0f, 1.0f, 0.1f),
				std::make_shared<SliderI>("Fresnel Dot Power", "iFresnelDotPower", 0, 100, 10),
				std::make_shared<SliderI>("Specular Dot Power", "iSpecularDotPower", 0, 100, 10),
				std::make_shared<SliderF>("Ambient Strength", "iAmbientStrength", 0.0f, 2.0f, 0.1f),
				std::make_shared<SliderF>("Diffuse Strength", "iDiffuseStrength", 0.0f, 2.0f, 0.1f),
				std::make_shared<SliderF>("Specular Strength", "iSpecularStrength", 0.0f, 2.0f, 0.1f),
			}),
			std::make_shared<SliderF>("Shade Shadow Threshold", "iShadeShadowThreshold", -0.1f, 1.0f, 0.1f),
			std::make_shared<GroupProperty>("Boime", std::vector<std::shared_ptr<Property>>{
				std::make_shared<SliderF>("Horizontal Scale", "iBiomeHorizontalScale", 0.1f, 100000.0f, 30000.0f),
				std::make_shared<SliderF>("Max Height", "iBiomeMaxHeight", 0.0f, 10.0f, 1.0f),
				std::make_shared<SliderI>("Layers", "iBiomeNumLayers", 1, 20, 4),
				std::make_shared<SliderF>("Horizontal Shirnk", "iBiomeHorizontalShrink", 1.0f, 4.0f, 1.9f),
				std::make_shared<SliderF>("Vertical Shrink", "iBiomeVerticalShrink", 0.1f, 0.99f, 0.5f),
			}),
			};

			std::cout << properties_[0]->to_json().dump(4) << std::endl;
		}
	protected:
		void gui() override;
	};
}
