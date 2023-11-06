#pragma once

#include <glm/glm.hpp>

#include "UIApp.h"
#include "ShaderClass.h"
#include "Properties/SliderProperty.h"
#include "Properties/RangeSliderProperty.h"
#include "Properties/ColorProperty.h"

namespace UI {

	class DomainRepPanel : public UIPanel {
	public:
		DomainRepPanel(const Shader& _shader)
			: UIPanel("Tree", _shader) {
			properties_ = {
				std::make_shared<SliderF>("Domain Size", "iDomainSize", 0.1f, 100.0f, 25.0f),
				std::make_shared<SliderF>("Radius", "iTreeRadius", 0.1f, 100.0f, 5.0f),
				std::make_shared<SliderF>("Height", "iTreeHeight", 0.1f, 100.0f, 20.0f),
				std::make_shared<SliderF>("Offset", "iTreeOffset", -50.0f, 50.0f, 0.0f),
				std::make_shared<SliderF>("Randomness", "iTreeRandomness",0.0f, 1.0f, 0.4f),
				std::make_shared<SliderI>("Steps", "iTreeSteps",0, 200, 64),
			};
		}
	protected:
		void gui() override;
	};
}
