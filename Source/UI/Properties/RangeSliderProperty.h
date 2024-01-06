#pragma once

#include <glm/glm.hpp>
#include <imgui.h>;
#include <imgui_impl_glfw.h>;
#include <imgui_impl_opengl3.h>;

#include "Property.h"
#include "ShaderClass.h"

namespace UI {
	template<typename T>
	class RangeSliderProperty : public Property {
	public:
		RangeSliderProperty(
			std::string_view _name, std::string_view _uniform_name,
			T _min, T _max, T _value_min, T _value_max, float _step = 0.01f)
			: Property(_name, _uniform_name), min_(_min), max_(_max),
			value_min_(_value_min), value_max_(_value_max), step_(_step) {}

		bool gui() override;

		void take_effect(const Shader& _shader) override;

		nlohmann::json to_json() const override {
			return {
				{"value_min", value_min_},
				{"value_max", value_max_},
			};
		}

		void from_json(const nlohmann::json& _json) override {
			value_min_ = _json.value("value_min", min_);
			value_max_ = _json.value("value_max", max_);
		}

		float get_value() const { return value_; }
		void set_value(float _value) { value_ = _value; }
	private:
		T min_;
		T max_;
		T value_min_;
		T value_max_;
		float step_;
	};;

	template<typename T>
	inline bool RangeSliderProperty<T>::gui() { return false; }

	template<typename T>
	inline void RangeSliderProperty<T>::take_effect(const Shader& _shader) {}

	template<>
	inline bool RangeSliderProperty<float>::gui() {

		bool b1 = ImGui::SliderFloat("Min", &value_min_, min_, max_, "%.1f");

		value_min_ = (value_min_ > value_max_) ? value_max_ : value_min_;

		bool b2 = ImGui::SliderFloat("Max", &value_max_, min_, max_, "%.1f");

		value_max_ = (value_max_ < value_min_) ? value_min_ : value_max_;

		return b1 || b2;
	}

	template<>
	inline void RangeSliderProperty<float>::take_effect(const Shader& _shader) {
		_shader.set_uniform_vec2(uniform_name_.data(), glm::vec2(value_min_, value_max_));
	}

	template<>
	inline bool RangeSliderProperty<int>::gui() {

		if (ImGui::TreeNodeEx(name_.data()
			//,ImGuiTreeNodeFlags_DefaultOpen | ImGuiTreeNodeFlags_Framed
		)) {

			bool b1 = ImGui::SliderInt("Min", &value_min_, min_, max_);

			value_min_ = (value_min_ > value_max_) ? value_max_ : value_min_;

			bool b2 = ImGui::SliderInt("Max", &value_max_, min_, max_);

			value_max_ = (value_max_ < value_min_) ? value_min_ : value_max_;

			ImGui::Separator();

			ImGui::TreePop();

			return b1 || b2;
		}
		return false;

	}

	template<>
	inline void RangeSliderProperty<int>::take_effect(const Shader& _shader) {
		_shader.set_uniform_vec2(uniform_name_.data(), glm::vec2(value_min_, value_max_));
	}

	using RangeSliderF = RangeSliderProperty<float>;
	using RangeSliderI = RangeSliderProperty<int>;

}
