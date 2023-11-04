#pragma once

#include "UIApp.h"
#include "ShaderClass.h"
#include "SliderProperty.h"
#include <glm/glm.hpp>

namespace UI {

	class RaymarchPanel : public UIPanel {
	public:
		RaymarchPanel(const Shader& _shader)
			: UIPanel("Raymarch", _shader) {
			properties_ = {
				std::make_shared<SliderPropI>("Shadow Steps", "iShadowSteps", 1, 1000, 32),
				std::make_shared<SliderPropI>("Max Steps", "iMaxSteps", 1, 1000, 500),
				std::make_shared<SliderPropF>("Step Size", "iStepSize", 0.1f, 100.0f, 50.0f),
				std::make_shared<SliderPropF>("Fog Strength", "iFogStrength", 0.0f, 1.0f, 0.1f),
			};
		}
	protected:
		void gui() override;
	};
}
