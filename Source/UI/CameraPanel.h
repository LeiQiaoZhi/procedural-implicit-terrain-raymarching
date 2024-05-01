#pragma once

#include "UIApp.h"
#include "UIUtils.h"
#include "Camera/CameraController.h"
#include "UI/Properties/SliderProperty.h"

namespace UI {

	class CameraPanel : public UIPanel {
	public:
		CameraPanel(const Shader& _shader, CameraController& _camera) 
			: UIPanel("Camera", _shader), camera_(_camera) {
			properties_ = {
			};
			focal_length = camera_.get_focal_length();
		}
	protected:
		void gui() override;
		nlohmann::json to_json() const override;
		void from_json(const nlohmann::json& _json) override;

	private:
		CameraController& camera_;
		float focal_length = 45.0f;
	};
}
