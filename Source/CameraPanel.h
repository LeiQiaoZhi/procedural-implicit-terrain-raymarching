#pragma once

#include "UIApp.h"
#include "UIUtils.h"
#include "CameraController.h"

namespace UI {

	class CameraPanel : public UIPanel {
	public:
		CameraPanel(CameraController& _camera) 
			: UIPanel("Camera"), camera_(_camera) {}
	protected:
		void gui() override;

	public:
		//int shadow_steps_ = 32;
	private:
		bool init_ = true;
		CameraController& camera_;
	};
}
