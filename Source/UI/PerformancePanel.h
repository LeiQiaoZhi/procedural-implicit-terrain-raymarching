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
		void set_frame_time(float _frame_time) { frame_time_ = _frame_time; }

	private:
		std::string fps_str_ = "EMPTY FPS STRING";
		float frame_time_;
	};
}
