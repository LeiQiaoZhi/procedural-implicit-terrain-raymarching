#pragma once

#include "imgui.h";
#include "imgui_impl_glfw.h";
#include "imgui_impl_opengl3.h";
#include <string>
#include <memory>

#include "Properties/SliderProperty.h"
#include "JsonUtils.h"
#include "UIUtils.h"

namespace UI {

	struct WindowInfo {
		ImVec2 pos;
		ImVec2 size;

		friend std::ostream& operator<<(std::ostream& _os, const WindowInfo& _info) {
			_os << "Window [pos=(" << _info.pos.x << ", " << _info.pos.y  
				<< "), size=(" << _info.size.x << ", " << _info.size.y << ")]";
			return _os;
		}
	};
	using WindowInfos = std::vector<WindowInfo>;

	class UIPanel {
	public:
		UIPanel(std::string _name, const Shader& _shader, float _scale = 1.5f)
			: panel_name_(_name), shader_(_shader), scale_(_scale) {}

		virtual WindowInfo show();
		virtual nlohmann::json to_json() const;
		virtual void from_json(const nlohmann::json& _json);

		virtual void gui() = 0;

		virtual void save_load_buttons();
		virtual void init_properties();
		void show_properties();

		// getters
		std::string get_name() { return panel_name_; }
		std::vector<std::shared_ptr<Property>>& get_properties() { return properties_; }

		

		// fields
	protected:
		const Shader& shader_;
		std::string panel_name_;
		float scale_;
		bool init_ = true;
		std::vector<std::shared_ptr<Property>> properties_;
	};
}
