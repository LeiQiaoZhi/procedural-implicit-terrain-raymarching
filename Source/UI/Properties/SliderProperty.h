#pragma once

#include <glm/glm.hpp>
#include <imgui.h>;
#include <imgui_impl_glfw.h>;
#include <imgui_impl_opengl3.h>;

#include "Property.h"
#include "ShaderClass.h"

namespace UI {
	template<typename T>
	class SliderProperty : public Property {
	public:
		SliderProperty(
			std::string_view _name, std::string_view _uniform_name,
			T _min, T _max, T _value, float _step = 0.01f)
			: Property(_name, _uniform_name), min_(_min), max_(_max), value_(_value), step_(_step) {}

		// float
		bool gui() override;

		void take_effect(const Shader& _shader) override;

		// json load and save
		nlohmann::json to_json() const override {
			return {
				{ "value", value_ }
			};
		}

		void from_json(const nlohmann::json& _json) override {
			value_ = _json.value("value", value_);
		}

		void add_glsl_to_json(nlohmann::json& _json) const override {
			std::string value_str = std::to_string(value_);
			_json[uniform_name_.data()] = value_str;
		}

		float get_value() const { return value_; }
		void set_value(float _value) { value_ = _value; }
	private:
		T min_;
		T max_;
		T value_;
		float step_;
	};;

	template<typename T>
	inline bool SliderProperty<T>::gui() { return false; }

	template<typename T>
	inline void SliderProperty<T>::take_effect(const Shader& _shader) {}

	template<>
	inline bool SliderProperty<float>::gui() {
		return ImGui::SliderFloat(name_.data(), &value_, min_, max_, "%.2f", step_);
	}

	template<>
	inline void SliderProperty<float>::take_effect(const Shader& _shader) {
		_shader.set_uniform_float(uniform_name_.data(), value_);
	}

	template<>
	inline bool SliderProperty<int>::gui() {
		return ImGui::SliderInt(name_.data(), &value_, min_, max_);
	}

	template<>
	inline void SliderProperty<int>::take_effect(const Shader& _shader) {
		_shader.set_uniform_int(uniform_name_.data(), value_);
	}

	using SliderF = SliderProperty<float>;
	using SliderI = SliderProperty<int>;

}
