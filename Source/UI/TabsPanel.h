#pragma once

#include <glm/glm.hpp>

#include "UIApp.h"
#include "ShaderClass.h"
#include "UI/Properties/VecSliderProperty.h"
#include "UI/Properties/BoolProperty.h"
#include "UI/Properties/ColorProperty.h"

namespace UI {

	class TabsPanel : public UIPanel {
	public:
		TabsPanel(std::string_view _name, const Shader& _shader, PanelsList&& _panels_list)
			: UIPanel(_name.data(), _shader), panels_list_(std::move(_panels_list)) {}

		nlohmann::json to_json() const override;
		void from_json(const nlohmann::json& _json) override;

		void save_load_buttons() override;

	protected:
		void gui() override;
		void init_properties() override;

		void panel_save_load_buttons(UIPanel& _panel);

	private:
		PanelsList panels_list_;

	};
}
