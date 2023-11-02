#pragma once

#include "UIApp.h"
#include "UIUtils.h"
#include "CameraController.h"
#include "SliderProperty.h"

namespace UI {

	class CameraPanel : public UIPanel {
	public:
		CameraPanel(const Shader& _shader, CameraController& _camera) 
			: UIPanel("Camera", _shader), camera_(_camera) {
			properties_ = {
				std::make_shared<SliderPropF>("Focal Length", "iFocalLength", 0.1f, 10.0f, 1.5f)
			};
		}
	protected:
		void gui() override;

	private:
		CameraController& camera_;
	};
}
