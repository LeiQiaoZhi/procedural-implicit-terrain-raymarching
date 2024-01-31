#pragma once

#include <glm/glm.hpp>

#include "UIApp.h"
#include "ShaderClass.h"
#include "Properties/SliderProperty.h"
#include "Properties/RangeSliderProperty.h"
#include "Properties/ColorProperty.h"
#include "Properties/GroupProperty.h"
#include "Properties/BoolProperty.h"

namespace UI {

	class PlanetPanel : public UIPanel {
	public:
		PlanetPanel(const Shader& _shader)
			: UIPanel("Planet", _shader) {
			properties_ = {
				std::make_shared<SliderF>("Radius", "iDebugSphereRadius", 0.0f, 100000.0f, 10000.0f),
				std::make_shared<SliderI>("Triplanar Sharpness", "iDebugTriplanarMappingSharpness", 1, 100, 1),
			};

		}
	protected:
		void gui() override {}
	};
}
