#pragma once

#include <glm/glm.hpp>

#include "UIApp.h"
#include "ShaderClass.h"
#include "Properties/SliderProperty.h"
#include "Properties/RangeSliderProperty.h"
#include "Properties/ColorProperty.h"

namespace UI {

	class TerrainPanel : public UIPanel {
	public:
		TerrainPanel(const Shader& _shader)
			: UIPanel("Terrain", _shader) {
			properties_ = {
				std::make_shared<SliderF>("Horizontal Scale", "iHorizontalScale", 0.1f, 10000.0f, 3000.0f),
				std::make_shared<SliderF>("Max Height", "iMaxHeight", 0.0f, 10000.0f, 1200.0f),
				std::make_shared<SliderI>("Layers", "iNumLayers", 1, 40, 12),
				std::make_shared<RangeSliderI>("Band Pass (Layers to Filter Out)", "iFilterRange", 1, 20, 1, 1),
				std::make_shared<SliderF>("Horizontal Shirnk", "iHorizontalShrink", 1.0f, 4.0f, 1.9f),
				std::make_shared<SliderF>("Vertical Shrink", "iVerticalShrink", 0.1f, 0.99f, 0.5f),
				std::make_shared<SliderF>("Starting Vertical Shrink", "iVerticalShrinkStart", 0.1f, 20.0f, 0.5f),
				std::make_shared<SliderF>("Grass Threshold", "iGrassThreshold", 0.0f, 1.0f, 0.9f),
				std::make_shared<SliderF>("Dirt Threshold", "iDirtThreshold", 0.0f, 1.0f, 0.95f),
				std::make_shared<ColorProperty>("Grass Color", "iGrassColor", "#5A9123"),
				std::make_shared<ColorProperty>("Dirt Color", "iDirtColor", "#BD724F"),
			};

			std::cout << properties_[0]->to_json().dump(4) << std::endl;
		}
	protected:
		void gui() override;
	};
}
