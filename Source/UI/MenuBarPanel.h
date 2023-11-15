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
		MenuBarPanel(const Shader& _shader, UIApp* _parent_app)
			: UIPanel("Menu Bar", _shader), parent_app(_parent_app) {}

	protected:
		WindowInfo show() override;
		void gui() override;

	private:
		UIApp* parent_app;
	};
}
