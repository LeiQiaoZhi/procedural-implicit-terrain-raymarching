#pragma once

#include <glm/glm.hpp>

#include "UIApp.h"
#include "ShaderClass.h"

namespace UI {

	class MenuBarPanel : public UIPanel {
	public:
		MenuBarPanel(Shader& _shader, UIApp* _parent_app)
			: UIPanel("Menu Bar", _shader), parent_app(_parent_app)
			, shader_modifiable_(_shader) {}

	protected:
		WindowInfo show() override;
		void gui() override;

	private:
		UIApp* parent_app;
		Shader& shader_modifiable_;
	};
}
