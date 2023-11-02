#pragma once

#include <glm/glm.hpp>

#include "UIApp.h"
#include "ShaderClass.h"
#include "SliderProperty.h"
#include "ColorProperty.h"

namespace UI {

	class TerrainPanel : public UIPanel {
	public:
		TerrainPanel(const Shader& _shader)
			: UIPanel("Terrain", _shader) {
			properties_ = {
				std::make_shared<SliderPropF>("Horizontal Scale", "iHorizontalScale", 0.0f, 10000.0f, 3000.0f),
				std::make_shared<SliderPropF>("Max Height", "iMaxHeight", 0.0f, 10000.0f, 1200.0f),
				std::make_shared<SliderPropI>("Layers", "iNumLayers", 1, 40, 12),
				std::make_shared<SliderPropF>("Grass Threshold", "iGrassThreshold", 0.0f, 1.0f, 0.9f),
				std::make_shared<SliderPropF>("Dirt Threshold", "iDirtThreshold", 0.0f, 1.0f, 0.95f),
				std::make_shared<ColorProperty>("Grass Color", "iGrassColor", "#5A9123"),
				std::make_shared<ColorProperty>("Dirt Color", "iDirtColor", "#BD724F"),
			};
		}
	protected:
		void gui() override;
	};
}
