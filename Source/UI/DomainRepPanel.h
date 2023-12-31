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
				std::make_shared<ColorProperty>("Color", "iTreeColor", "#4CB22D"),
				std::make_shared<SliderF>("Normal Epsilon", "iTreeNormalEpsilon",1.0f, 100.0f, 10.0f),
				std::make_shared<SliderF>("Terrain Normal Proportion", "iTreeNormalTerrainProportion",0.0f, 10.0f, 2.0f),
				std::make_shared<GroupProperty>("Shadow", std::vector<std::shared_ptr<Property>>{
					std::make_shared<SliderI>("Shadow Steps", "iTreeShadowSteps",0, 200, 16),
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
			};
		}
	protected:
		void gui() override;
	};
}
