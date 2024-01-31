#pragma once

#include <glm/glm.hpp>

#include "UIApp.h"
#include "ShaderClass.h"
#include "Properties/SliderProperty.h"
#include "Properties/ColorProperty.h"

namespace UI {

	class MotionPanel : public UIPanel {
	public:
		MotionPanel(const Shader& _shader)
			: UIPanel("Motion", _shader) {
			properties_ = {
				std::make_shared<SliderF>("Speed", "iMotionSpeed", 0, 1, 0.1),
			};
		}
	protected:
		void gui() override {};
	};
}
