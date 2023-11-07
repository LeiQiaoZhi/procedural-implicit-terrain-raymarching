#pragma once

#include <glm/glm.hpp>

#include "UIApp.h"
#include "ShaderClass.h"
#include "Properties/SliderProperty.h"

namespace UI {

	class RaymarchPanel : public UIPanel {
	public:
		RaymarchPanel(const Shader& _shader)
			: UIPanel("Raymarch", _shader) {
			properties_ = {
				std::make_shared<SliderI>("Shadow Steps", "iShadowSteps", 0, 1000, 32),
				std::make_shared<SliderI>("Max Steps", "iMaxSteps", 1, 1000, 500),
				std::make_shared<SliderF>("Step Size", "iStepSize", 0.1f, 100.0f, 50.0f),
				std::make_shared<SliderF>("Fog Strength", "iFogStrength", 0.0f, 10.0f, 1.0f),
			};
		}
	protected:
		void gui() override;
	};
}
