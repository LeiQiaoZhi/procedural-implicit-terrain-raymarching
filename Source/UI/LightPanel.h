#pragma once

#include <glm/glm.hpp>

#include "UIApp.h"
#include "ShaderClass.h"
#include "UI/Properties/VecSliderProperty.h"

namespace UI {

	class LightPanel : public UIPanel {
	public:
		LightPanel(const Shader& _shader, CameraController& _camera)
			: UIPanel("Light", _shader), camera_(_camera) {
			properties_ = {
				/*std::make_shared<SliderF3V>("Sun Position", "iSunPos", 
					std::array<float, 3>{0.0f, 0.0f, 0.0f},
					-100000, 100000),*/
				std::make_shared<SliderF>("Theta", "iTheta", 0.0f, 3.14f, 0.0f),
				std::make_shared<SliderF>("Phi", "iPhi", 0.0f, 2 * 3.14f, 0.0f),
				std::make_shared<SliderF>("Radius", "iRadius", 0.0f, 1000000.0f, 40000.0f)
			};
		}
		nlohmann::json to_json() const override;
		void from_json(const nlohmann::json& _json) override;


	protected:
		void gui() override;
	private:
		void update_sun_pos();

	private:
		CameraController& camera_;
		float theta_ = 0.0f;
		float phi_ = 0.0f;
		float radius_ = 40000.0f;

	};
}
