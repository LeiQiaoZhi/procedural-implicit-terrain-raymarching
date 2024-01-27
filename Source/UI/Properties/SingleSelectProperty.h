#pragma once

#include <glm/glm.hpp>
#include <imgui.h>;
#include <imgui_impl_glfw.h>;
#include <imgui_impl_opengl3.h>;
#include <nlohmann/json.hpp>

#include "UI/UIUtils.h"
#include "Property.h"
#include "ShaderClass.h"

namespace UI {

	class SingleSelectProperty : public Property {
	public:
		SingleSelectProperty(
			std::string_view _name, std::string_view _uniform_name,
			int _selected, std::vector<std::string> _items
		) : Property(_name, _uniform_name), selected_(_selected), item_strs_(std::move(_items))  {
			// convert vector of strings to vector of const char*
			for (const auto& item : item_strs_) 
				items_.push_back(item.c_str());
		}

		// float
		bool gui() override {
			value_changed_ = ImGui::Combo(name_.data(), &selected_, items_.data(), items_.size());
			return value_changed_;
		}

		void take_effect(const Shader& _shader) override {
			_shader.set_uniform_int(uniform_name_.data(), selected_);
		}

		nlohmann::json to_json() const override {
			return {
				{ "value", selected_ }
			};
		}

		void from_json(const nlohmann::json& _json) override {
			selected_ = _json.value("value", 0);
		}

		void add_glsl_to_json(nlohmann::json& _json) const override {
            std::string selected_str = std::to_string(selected_);
            _json[uniform_name_.data()] = selected_str;
		}

		// getters
		int get_selected() const { return selected_; }
		bool get_value_changed() const { return value_changed_; }
		std::string get_selected_str() const { return item_strs_[selected_]; }

	private:
		bool value_changed_;
		int selected_;
		std::vector<std::string> item_strs_;
		std::vector<const char*> items_;
	};;
}
