#pragma once

#include <glm/glm.hpp>

#include "UIApp.h"
#include "ShaderClass.h"
#include "Properties/SliderProperty.h"
#include "Properties/ColorProperty.h"
#include "Properties/BoolProperty.h"
#include "Properties/SingleSelectProperty.h"

namespace UI {

	class RaymarchPanel : public UIPanel {
	public:
		RaymarchPanel(const Shader& _shader)
			: UIPanel("Raymarch", _shader) {
			properties_ = {
				std::make_shared<BoolProperty>("Distance Scale with Focal Length", "iRaymachDistanceScaleWithFocalLength", true),
				std::make_shared<SliderI>("BS refine steps", "iBinarySearchRefineSteps", 0, 100, 32),
				std::make_shared<SliderI>("Shadow Steps", "iTerrainShadowSteps", 0, 1000, 32),
				std::make_shared<SliderF>("Shadow Step Size", "iTerrainShadowStepSize", 0, 1000, 32),
				std::make_shared<SliderI>("Max Distance", "iMaxDistance", 1, 100000, 50000),
				std::make_shared<SliderI>("Max Steps", "iMaxSteps", 1, 1000, 500),
				std::make_shared<SliderF>("Min Step Size", "iMinStepSize", 0.1f, 100.0f, 10.0f),
				std::make_shared<SliderF>("Max Step Size", "iMaxStepSize", 0.1f, 10000.0f, 100.0f),
				std::make_shared<SliderF>("Start Step Size", "iStepSize", 5.0f, 100.0f, 20.0f),
				std::make_shared<SliderF>("Step Size Above Tree Ratio", "iStepSizeAboveTreeRatio", 0.0f, 100.0f, 0.01f),
				std::make_shared<SingleSelectProperty>("Step Size Distance Relationship", "iStepSizeFunctionSwitch", 0, std::vector<std::string>{
					"Linear",
					"Log",
					"Exp",
					"Smoothstep",
				}),
				std::make_shared<SliderF>("Linear Step Size Distance Ratio",
					"iStepSizeDistanceRatio", 0.0f, 1.0f, 0.01f),
				std::make_shared<SliderF>("Log Step Size Distance Ratio",
					"iStepSizeDistanceLogRatio", 0.0f, 100.0f, 0.01f),
				std::make_shared<SliderF>("Exp Step Size Distance Ratio", 
					"iStepSizeDistanceExpRatio", 0.0f, 1.0f, 0.01f),
				std::make_shared<SliderF>("Smoothstep Step Size Right Edge", 
					"iStepSizeSmoothStepRightEdge", 100.0f, 100000.0f, 10000.0f),
			};
		}
	protected:
		void gui() override;
	};
}
