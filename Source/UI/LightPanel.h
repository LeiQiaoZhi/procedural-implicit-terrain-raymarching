#pragma once

#include <glm/glm.hpp>

#include "UIApp.h"
#include "ShaderClass.h"
#include "UI/Properties/VecSliderProperty.h"

namespace UI {

	class LightPanel : public UIPanel {
	public:
		LightPanel(const Shader& _shader)
			: UIPanel("Light", _shader) {
			properties_ = {
				std::make_shared<SliderF3V>("Sun Position", "iSunPos", 
					std::array<float, 3>{0.0f, 0.0f, 0.0f},
					-10000, 10000)
			};
		}
	protected:
		void gui() override;
	};
}
