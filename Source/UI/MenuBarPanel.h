#pragma once

#include <glm/glm.hpp>

#include "UIApp.h"
#include "ShaderClass.h"
#include "UI/Properties/SliderProperty.h"
#include "UI/Properties/ColorProperty.h"
#include "UI/Properties/VecProperty.h"

namespace UI {

	class MenuBarPanel : public UIPanel {
	public:
		MenuBarPanel(const Shader& _shader)
			: UIPanel("Menu Bar", _shader) {}
	protected:
		void show() override;
		void gui() override;
	};
}
