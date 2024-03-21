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
			std::make_shared<BoolProperty>("Terrain Raymarch Steps", "iProfileRaymarchSteps", false),
			std::make_shared<BoolProperty>("Terrain Shadow Steps", "iProfileShadowSteps", false),
			std::make_shared<BoolProperty>("Clouds Raymarch Steps", "iProfileCloudRaymarchSteps", false),
			std::make_shared<BoolProperty>("Tree Raymarch Steps", "iProfileTreeRaymarchSteps", false),
			std::make_shared<BoolProperty>("Last Step Size", "iProfileLastStepSize", false),
			std::make_shared<ColorProperty>("Min Color", "iProfileRaymarchStepsMinColor", "#00ff00"),
			std::make_shared<ColorProperty>("Max Color", "iProfileRaymarchStepsMaxColor", "#ff0000"),
			std::make_shared<BoolProperty>("Mark True Max", "iProfileMarkTrueMaxColor", false),
			std::make_shared<ColorProperty>("True Max Color", "iProfileTrueMaxColor", "#ff0000"),
			std::make_shared<BoolProperty>("Use Custom Max", "iProfileUseCustomMax", false),
			std::make_shared<SliderF>("Custom Max", "iProfileCustomMax", 0, 10000, 10)
			};
		}
	protected:
		void gui() override {};
	};
}
