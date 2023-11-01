#pragma once

#include "UIApp.h"
#include "ShaderClass.h"
#include <glm/glm.hpp>

namespace UI {

	class DebugPanel : public UIPanel {
	public:
		DebugPanel(Shader& _shader) : UIPanel("Debug"), shader_(_shader) {}
	protected:
		void gui() override;

	public:
		int shadow_steps_ = 32;
		int max_steps_ = 500;
		float step_size_ = 50.0f;
		float focal_length_ = 1.5f;
		float fog_strength_ = 0.8f;
		float grass_threshold_ = 0.9f;
		float dirt_threshold_ = 0.95f;
		glm::vec3 grass_color_ = glm::vec3(0.0f, 1.0f, 0.0f);
	private:
		bool init_ = true;
		Shader& shader_;
	};
}
