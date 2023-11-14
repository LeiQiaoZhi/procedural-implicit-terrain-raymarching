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

	template <typename T, int size>
	class VecProperty : public Property {
	public:
		VecProperty(
			const std::string& _name, const std::string& _uniform_name,
			T x = 0, T y = 0, T z = 0
		) : name_(_name), uniform_name_(_uniform_name) {
			values_[0] = x;
			values_[1] = y;
			values_[2] = z;
		}

		bool gui() override;

		void take_effect(const Shader& _shader) override;

		nlohmann::json to_json() const override {
			return { {"values", {values_[0], values_[1], values_[2]}} };
		}

		void from_json(const nlohmann::json& _json) override {
			if (_json["values"].is_array() && _json["values"].size() == 3) {
				for (size_t i = 0; i < _json["values"].size(); ++i) {
					values_[i] = _json["values"].at(i);
				}
			}
			else {
				std::cerr << "JSON does not contain a float array of size 3." << std::endl;
			}
		}

	private:
		std::string name_;
		std::string uniform_name_;
		T values_[3];
	};;


	template<typename T, int size>
	inline bool VecProperty<T, size>::gui() { return false; }

	template<typename T, int size>
	inline void VecProperty<T, size>::take_effect(const Shader& _shader)
	{
		if constexpr (size == 2) {
			const auto vec2 = glm::vec2(values_[0], values_[1]);
			_shader.set_uniform_vec2(uniform_name_, vec2);
		}
		else if constexpr (size == 3) {
			const auto vec3 = glm::vec3(values_[0], values_[1], values_[2]);
			_shader.set_uniform_vec3(uniform_name_, vec3);
		}
	}

	template<>
	inline bool VecProperty<float, 3>::gui()
	{
		return ImGui::InputFloat3(name_.c_str(), values_, "%.2f");
	}

	template<>
	inline bool VecProperty<float, 2>::gui()
	{
		return ImGui::InputFloat2(name_.c_str(), values_, "%.2f");
	}

	template<>
	inline bool VecProperty<int, 3>::gui()
	{
		return ImGui::InputInt3(name_.c_str(), values_);
	}

	template<>
	inline bool VecProperty<int, 2>::gui()
	{
		return ImGui::InputInt2(name_.c_str(), values_);
	}

	using Float3 = VecProperty<float, 3>;
	using Float2 = VecProperty<float, 2>;
	using Int3 = VecProperty<int, 3>;
	using Int2 = VecProperty<int, 2>;
}
