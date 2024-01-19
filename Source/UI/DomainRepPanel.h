#pragma once

#include <glm/glm.hpp>

#include "UIApp.h"
#include "ShaderClass.h"
#include "Properties/SliderProperty.h"
#include "Properties/VecProperty.h"
#include "Properties/RangeSliderProperty.h"
#include "Properties/ColorProperty.h"
#include "Properties/BoolProperty.h"
#include "Properties/GroupProperty.h"
#include "Properties/LabelProperty.h"

namespace UI {

	class DomainRepPanel : public UIPanel {
	public:
		DomainRepPanel(const Shader& _shader)
			: UIPanel("Tree", _shader) {
			properties_ = {

	std::make_shared<BoolProperty>("Enable", "iTreeEnabled", true),
	std::make_shared<SliderF>("Domain Size", "iTreeDomainSize", 0.1f, 100.0f, 25.0f),
	std::make_shared<SliderF>("Radius", "iTreeRadius", 0.1f, 100.0f, 5.0f),
	std::make_shared<SliderF>("Height", "iTreeHeight", 0.1f, 100.0f, 20.0f),
	std::make_shared<SliderF>("Offset", "iTreeOffset", -50.0f, 50.0f, 0.0f),
	std::make_shared<SliderF>("Position Randomness", "iTreeRandomness",0.0f, 1.0f, 0.8f),
	std::make_shared<SliderI>("Steps", "iTreeSteps",0, 200, 64),
	std::make_shared<SliderF>("Steepness Threshold", "iTreeSteepnessThreshold",0.0f, 1.0f, 0.5f),
	std::make_shared<Float2>("Size Randomness", "iTreeSizeRandomness", std::array<float, 2>{0,0}),
	std::make_shared<SliderF>("Normal Epsilon", "iTreeNormalEpsilon",1.0f, 100.0f, 10.0f),
	std::make_shared<SliderF>("Terrain Normal Proportion", "iTreeNormalTerrainProportion",0.0f, 10.0f, 2.0f),
	std::make_shared<GroupProperty>("Shadow", std::vector<std::shared_ptr<Property>>{
		std::make_shared<SliderI>("Shadow Steps", "iTreeShadowSteps",0, 50, 16),
		std::make_shared<SliderF>("Shadow Threshold", "iTreeShadowThreshold",0.0f, 50.0f, 0.5f),
		std::make_shared<SliderF>("Shadow Lower", "iTreeShadowLower",-10000.0f, 0.0f, -100.0f),
	}),
	std::make_shared<GroupProperty>("FBM", std::vector<std::shared_ptr<Property>>{
		std::make_shared<SliderF>("FBM strength", "iTreeFbmStrength",0.0f, 10.0f, 2.0f),
		std::make_shared<SliderF>("Horizontal Scale", "iTreeHorizontalScale", 0.1f, 100.0f, 30.0f),
		std::make_shared<SliderF>("Max Height", "iTreeMaxHeight", 0.0f, 100.0f, 1200.0f),
		std::make_shared<SliderI>("Layers", "iTreeNumLayers", 1, 40, 12),
		std::make_shared<RangeSliderI>("Band Pass (Layers to Filter Out)", "iFilterRange", 1, 20, 1, 1),
		std::make_shared<SliderF>("Horizontal Shirnk", "iTreeHorizontalShrink", 1.0f, 4.0f, 1.9f),
		std::make_shared<SliderF>("Vertical Shrink", "iTreeVerticalShrink", 0.01f, 0.99f, 0.5f),
		std::make_shared<SliderF>("Starting Vertical Shrink", "iTreeVerticalShrinkStart", 0.01f, 2.0f, 0.5f),
	}),
	std::make_shared<GroupProperty>("Species", std::vector<std::shared_ptr<Property>>{
		std::make_shared<SliderF>("S2 Lower Threshold", "iTreeS2LowerThreshold",-2.0f, 2.0f, 0.0f),
		std::make_shared<SliderF>("S2 Radius Factor", "iTreeS2RadiusFactor",0.0f, 2.0f, 0.5f),
		std::make_shared<SliderF>("S2 Height Factor", "iTreeS2HeightFactor",0.0f, 1.0f, 0.5f),
		std::make_shared<LabelProperty>("Colors"),
		std::make_shared<ColorProperty>("S1 Color", "iTreeColor", "#4CB22D"),
		std::make_shared<ColorProperty>("S2 Color", "iTreeColorS2", "#4CB22D"),
		std::make_shared<ColorProperty>("S1 Old Color", "iTreeOldColor", "#4CB22D"),
		std::make_shared<ColorProperty>("S2 Old Color", "iTreeOldColorS2", "#4CB22D"),
		std::make_shared<LabelProperty>("FBM"),
		std::make_shared<SliderF>("Horizontal Scale", "iTreeSpeciesHorizontalScale", 0.1f, 1000.0f, 30.0f),
		std::make_shared<SliderI>("Layers", "iTreeSpeciesNumLayers", 1, 40, 12),
		std::make_shared<SliderF>("Horizontal Shirnk", "iTreeSpeciesHorizontalShrink", 1.0f, 4.0f, 1.9f),
		std::make_shared<SliderF>("Vertical Shrink", "iTreeSpeciesVerticalShrink", 0.01f, 0.99f, 0.5f),
		std::make_shared<SliderF>("Starting Vertical Shrink", "iTreeSpeciesVerticalShrinkStart", 0.01f, 2.0f, 0.5f),
	}),
	std::make_shared<GroupProperty>("Lighting", std::vector<std::shared_ptr<Property>>{
		std::make_shared<SliderF>("Fresnel F0", "iTreeFresnelNormalIncidence", 0.0f, 1.0f, 0.1f),
		std::make_shared<SliderI>("Fresnel Dot Power", "iTreeFresnelDotPower", 0, 100, 10),
		std::make_shared<SliderI>("Specular Dot Power", "iTreeSpecularDotPower", 0, 100, 10),
		std::make_shared<SliderF>("Ambient Strength", "iTreeAmbientStrength", 0.0f, 2.0f, 0.1f),
		std::make_shared<SliderF>("Diffuse Strength", "iTreeDiffuseStrength", 0.0f, 2.0f, 0.1f),
		std::make_shared<SliderF>("Specular Strength", "iTreeSpecularStrength", 0.0f, 2.0f, 0.1f),
		std::make_shared<SliderF>("Occulusion Lower", "iTreeOcculusionLower", -2.0f, 2.0f, 0.1f),
		std::make_shared<SliderF>("Occulusion Upper", "iTreeOcculusionUpper", -2.0f, 2.0f, 0.1f),
	}),

			};
		}
	protected:
		void gui() override;
	};
}
