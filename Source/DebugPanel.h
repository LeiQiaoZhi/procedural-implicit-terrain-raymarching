#pragma once

#include "UIApp.h"
#include "ShaderClass.h"

namespace UI {

	class DebugPanel : public UIPanel {
	public:
		DebugPanel(Shader& _shader) : UIPanel("Debug"), shader_(_shader) {}
	protected:
		void gui() override;

	public:
		int shadow_steps_ = 32;
	private:
		bool init_ = true;
		Shader& shader_;
	};
}
