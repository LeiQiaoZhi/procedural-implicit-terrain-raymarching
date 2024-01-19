#pragma once

#include "UIPanel.h"
#include "ShaderClass.h"

namespace UI {

	class PerformancePanel : public UIPanel {
	public:
		PerformancePanel(const Shader& _shader)
			: UIPanel("Performance", _shader) {
			
		}

		void gui() override;

		// setter
		void set_fps_str(std::string_view _fps_str) { fps_str_ = _fps_str; }

	private:
		std::string fps_str_ = "EMPTY FPS STRING";
	};
}
