#pragma once

#include <glm/glm.hpp>
#include <imgui.h>;
#include <imgui_impl_glfw.h>;
#include <imgui_impl_opengl3.h>;

#include "UI/UIUtils.h"
#include "Property.h"
#include "ShaderClass.h"

namespace UI {

	template <typename T, int size>
	class VecProperty : public Property {
	public:
		VecProperty(
			std::string_view _name, std::string_view _uniform_name,
			std::array<T, size> _values
		) : Property(_name, _uniform_name), values_(_values) {}

		bool gui() override {
			return UI::InputVec<T, size>(name_.data(), values_.data(), "%.2f");
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
	};;


	using Float3 = VecProperty<float, 3>;
	using Float2 = VecProperty<float, 2>;
	using Int3 = VecProperty<int, 3>;
	using Int2 = VecProperty<int, 2>;
}
