#pragma once

#include "UIApp.h"
#include "ShaderClass.h"
#include "SliderProperty.h"
#include <glm/glm.hpp>

namespace UI {

	class DebugPanel : public UIPanel {
	public:
		DebugPanel(const Shader& _shader)
			: UIPanel("Debug", _shader) {
			properties_ = {
				std::make_shared<SliderPropI>("Shadow Steps", "iShadowSteps", 1, 1000, 32),
				std::make_shared<SliderPropI>("Max Steps", "iMaxSteps", 1, 1000, 500),
				std::make_shared<SliderPropF>("Step Size", "iStepSize", 0.1f, 100.0f, 50.0f),
				std::make_shared<SliderPropF>("Fog Strength", "iFogStrength", 0.0f, 1.0f, 0.1f),
				std::make_shared<SliderPropF>("Grass Threshold", "iGrassThreshold", 0.0f, 1.0f, 0.9f),
				std::make_shared<SliderPropF>("Dirt Threshold", "iDirtThreshold", 0.0f, 1.0f, 0.95f),
			};
		}
	protected:
		void gui() override;

	public:
		glm::vec3 grass_color_ = glm::vec3(0.0f, 1.0f, 0.0f);
	};
}
