#pragma once

#include <glm/glm.hpp>

#include "UIApp.h"
#include "ShaderClass.h"
#include "UI/Properties/SingleSelectProperty.h"

namespace UI {

	class DebugPanel : public UIPanel {
	public:
		DebugPanel(const Shader& _shader)
			: UIPanel("Debug", _shader) {
			properties_ = {
				std::make_shared<SingleSelectProperty>("Render Target", "iDebugRenderTarget", 0, 
					std::vector<std::string>{
						"Default", "Noise2D", "Depth", "OpticalDepth"
				})
			};
		}
	protected:
		void gui() override;
	};
}
