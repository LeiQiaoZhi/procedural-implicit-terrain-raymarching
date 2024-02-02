#pragma once

#include <glm/glm.hpp>

#include "UIApp.h"
#include "ShaderClass.h"
#include "Properties/SliderProperty.h"
#include "Properties/ColorProperty.h"

namespace UI {

	class RaymarchPanel : public UIPanel {
	public:
		RaymarchPanel(const Shader& _shader)
			: UIPanel("Raymarch", _shader) {
			properties_ = {
				std::make_shared<SliderI>("Shadow Steps", "iTerrainShadowSteps", 0, 1000, 32),
				std::make_shared<SliderF>("Shadow Step Size", "iTerrainShadowStepSize", 0, 1000, 32),
				std::make_shared<SliderI>("Max Distance", "iMaxDistance", 1, 100000, 50000),
				std::make_shared<SliderI>("Max Steps", "iMaxSteps", 1, 1000, 500),
				std::make_shared<SliderF>("Step Size", "iStepSize", 0.1f, 1000.0f, 100.0f),
				std::make_shared<SliderF>("Step Size Distance Ratio", "iStepSizeDistanceRatio", 0.0f, 1.0f, 0.01f),
				std::make_shared<SliderF>("Step Size Above Tree Ratio", "iStepSizeAboveTreeRatio", 0.0f, 10.0f, 0.01f),
			};
		}
	protected:
		void gui() override;
	};
}
