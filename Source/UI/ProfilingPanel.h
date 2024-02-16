#pragma once

#include <glm/glm.hpp>

#include "UIApp.h"
#include "ShaderClass.h"
#include "UI/Properties/SliderProperty.h"
#include "UI/Properties/ColorProperty.h"
#include "UI/Properties/VecProperty.h"
#include "UI/Properties/BoolProperty.h"
#include "UI/Properties/LabelProperty.h"
#include "UI/Properties/GroupProperty.h"
#include "UI/Properties/RangeSliderProperty.h"
#include "UI/Properties/VecSliderProperty.h"

namespace UI {

	class ProfilingPanel : public UIPanel {
	public:
		ProfilingPanel(const Shader& _shader)
			: UIPanel("Profiling", _shader) {
			properties_ = {
			std::make_shared<BoolProperty>("Raymarch Steps", "iProfileRaymarchSteps", true),
			std::make_shared<BoolProperty>("Terrain Shadow Steps", "iProfileShadowSteps", true),
			std::make_shared<ColorProperty>("Min Color", "iProfileRaymarchStepsMinColor", "#00ff00"),
			std::make_shared<ColorProperty>("Max Color", "iProfileRaymarchStepsMaxColor", "#ff0000"),
			};
		}
	protected:
		void gui() override {};
	};
}
