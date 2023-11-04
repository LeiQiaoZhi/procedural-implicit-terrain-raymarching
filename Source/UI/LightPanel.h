#pragma once

#include <glm/glm.hpp>

#include "UIApp.h"
#include "ShaderClass.h"
#include "SliderProperty.h"
#include "ColorProperty.h"
#include "Float3Property.h"

namespace UI {

	class LightPanel : public UIPanel {
	public:
		LightPanel(const Shader& _shader)
			: UIPanel("Light", _shader) {
			properties_ = {
				std::make_shared<Float3Property>("Sun Position", "iSunPos", 200, 3000, 2000)
			};
		}
	protected:
		void gui() override;
	};
}
