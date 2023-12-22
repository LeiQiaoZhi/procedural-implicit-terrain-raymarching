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
							"Default", 
							"Noise2D",
							"Depth",
							"OpticalDepth",
							"Noise3D"
				})
			};
		}
	protected:
		void gui() override;

	private:
		float noise3D_z_ = 0.0f;
	};
}
