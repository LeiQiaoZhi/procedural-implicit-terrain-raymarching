#pragma once

#include <glm/glm.hpp>

#include "UIApp.h"
#include "ShaderClass.h"
#include "UI/Properties/SliderProperty.h"
#include "UI/Properties/ColorProperty.h"
#include "UI/Properties/VecProperty.h"
#include "UI/Properties/BoolProperty.h"
#include "UI/Properties/LabelProperty.h"
#include "UI/Properties/GroupProperty.h"
#include "UI/Properties/RangeSliderProperty.h"

namespace UI {

	class CloudPanel : public UIPanel {
	public:
		CloudPanel(const Shader& _shader)
			: UIPanel("Clouds", _shader) {
			properties_ = {
			std::make_shared<BoolProperty>("Enabled", "iEnableClouds", true),
			std::make_shared<SliderF>("Box Lower Y", "iCloudBoxLowerY", 0, 10000, 7000),
			std::make_shared<SliderF>("Box Upper Y", "iCloudBoxUpperY", 0, 20000, 8000),
			std::make_shared<SliderI>("Steps", "iCloudRaymarchSteps", 0, 1000, 10),
			std::make_shared<SliderF>("Strength", "iCloudStrength", 0, 10, 0.5),
			std::make_shared<SliderF>("Density", "iCloudDensity", -10000, 10000, 0.0),
			std::make_shared<GroupProperty>("Raymarch", std::vector<std::shared_ptr<Property>>{
				//std::make_shared<SliderF>("Fbm Strength", "iCloudFbmStrength", 0, 10, 0.5),
				std::make_shared<SliderF>("Min Stepsize", "iCloudMinStepSize", 0, 100, 0.5),
				std::make_shared<SliderF>("Max Ray Distance", "iCloudMaxRaymarchDist", 0, 100000, 10000),
				std::make_shared<SliderF>("Step Dist Scale", "iCloudStepDistScale", 0, 0.2 , 0.01),
				std::make_shared<SliderF>("Step Density Scale", "iCloudStepDensityScale", 0, 2 , 1)
			}),
			std::make_shared<GroupProperty>("Front to Back Blending", std::vector<std::shared_ptr<Property>>{
				std::make_shared<SliderF>("Sample Alpha", "iCloudSampleAlpha", 0, 10 , 0.1),
				//std::make_shared<SliderF>("Max Cum Alpha", "iCloudMaxCumAlpha", 0, 1 , 1),
				std::make_shared<SliderF>("Base Color", "iCloudBaseColor", 0, 10 , 1),
			}),
			std::make_shared<GroupProperty>("FBM", std::vector<std::shared_ptr<Property>>{
				std::make_shared<SliderF>("Horizontal Scale", "iCloudHorizontalScale", 0.1f, 20000.0f, 3000.0f),
				std::make_shared<SliderF>("Max Height", "iCloudMaxHeight", 0.0f, 20000.0f, 1200.0f),
				std::make_shared<SliderI>("Layers", "iCloudNumLayers", 1, 40, 12),
				std::make_shared<RangeSliderI>("Band Pass (Layers to Filter Out)", "iCloudFilterRange", 1, 20, 1, 1),
				std::make_shared<RangeSliderI>("Normal Band Pass", "iCloudNormalFilterRange", 1, 20, 1, 1),
				std::make_shared<SliderF>("Horizontal Shirnk", "iCloudHorizontalShrink", 1.0f, 4.0f, 1.9f),
				std::make_shared<SliderF>("Vertical Shrink", "iCloudVerticalShrink", 0.1f, 0.99f, 0.5f),
				//std::make_shared<SliderF>("Starting Vertical Shrink", "iCloudVerticalShrinkStart", 0.1f, 20.0f, 0.5f),
			}),
			std::make_shared<GroupProperty>("Lighting", std::vector<std::shared_ptr<Property>>{
				std::make_shared<SliderF>("Ambient", "iCloudAmbient", 0.0f, 10.0f, 0.4f),
				std::make_shared<SliderF>("Diffuse", "iCloudDiffuse", 0.0f, 10.0f, 0.6f),
				std::make_shared<SliderI>("Shadow Steps", "iCloudShadowSteps", 0, 100, 1),
				std::make_shared<SliderF>("Shadow Step Size", "iCloudShadowStepSize", 0.0f, 1000.0f, 100.0f),
			}),
			std::make_shared<SliderF>("Blend", "iCloudObjBlendStrength", 0.0f, 100.0f, 1.0f),
			};
		}
	protected:
		void gui() override;
	};
}
