#pragma once

#include <glm/glm.hpp>
#include <imgui.h>;
#include <imgui_impl_glfw.h>;
#include <imgui_impl_opengl3.h>;

#include "UI/UIUtils.h"
#include "Property.h"
#include "ShaderClass.h"

namespace UI {

	template <typename T, int size, bool verbose>
	class VecSliderProperty : public Property {
	public:
		VecSliderProperty(
			std::string_view _name, std::string_view _uniform_name,
			std::array<T, size> _values, T _min, T _max
		) : Property(_name, _uniform_name), values_(_values), min_(_min), max_(_max) {}

		bool gui() override {
			if constexpr (verbose) {
				if (!ImGui::CollapsingHeader(name_.data()))
					return false;
				bool changed = false;
				for (int i = 0; i < size; ++i) {
					changed |= UI::SliderT<T>(std::to_string(i).c_str(), &values_[i], min_, max_, "%.2f");
				}
				return changed;
			}

			return UI::SliderVec<T, size>(name_.data(), values_.data(), min_, max_, "%.2f");
		}

		void take_effect(const Shader& _shader) override {
			if constexpr (size == 2) {
				const auto vec2 = glm::vec2(values_[0], values_[1]);
				_shader.set_uniform_vec2(uniform_name_.data(), vec2);
			}
			else if constexpr (size == 3) {
				const auto vec3 = glm::vec3(values_[0], values_[1], values_[2]);
				_shader.set_uniform_vec3(uniform_name_.data(), vec3);
			}
		}

		nlohmann::json to_json() const override {
			nlohmann::json json;
			json["values"] = values_;
			return json;
		}

		void from_json(const nlohmann::json& _json) override {
			values_ = _json["values"].get<std::array<T, size>>();
		}

	private:
		std::array<T, size> values_;
		T min_;
		T max_;
	};


	using SliderF3 = VecSliderProperty<float, 3, false>;
	using SliderF2 = VecSliderProperty<float, 2, false>;
	using SliderI3 = VecSliderProperty<int, 3, false>;
	using SliderI2 = VecSliderProperty<int, 2, false>;

	using SliderF3V = VecSliderProperty<float, 3, true>;
	using SliderF2V = VecSliderProperty<float, 2, true>;
	using SliderI3V = VecSliderProperty<int, 3, true>;
	using SliderI2V = VecSliderProperty<int, 2, true>;
}
