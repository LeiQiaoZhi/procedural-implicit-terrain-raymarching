#pragma once
#include <imgui.h>
#include <glm/glm.hpp>

namespace UI {
	inline void print_vector(const char* _name, const glm::vec3& _vec) {
		ImGui::Text(_name);
		ImGui::Text("(%.2f, %.2f, %.2f)", _vec.x, _vec.y, _vec.z);
	}
}