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
			render_target_property_ =
				std::make_shared<SingleSelectProperty>("Render Target", "iDebugRenderTarget", 0,
					std::vector<std::string>{
				"Default",
					"Noise2D",
					"Depth",
					"OpticalDepth",
					"Noise3D"
			});
			properties_ = { 
				render_target_property_
			};
		}
	protected:
		void gui() override;

	private:
		std::shared_ptr<SingleSelectProperty> render_target_property_;
		bool mark_not_in_atmosphere = false;
		float noise3D_z_ = 0.0f;
		float max_distance_ = 10000.0f;
	};
}
