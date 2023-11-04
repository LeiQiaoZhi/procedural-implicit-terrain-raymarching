#pragma once
#include <imgui.h>
#include <glm/glm.hpp>
#include <string>
#include <iostream>
#include <sstream>
#include <iomanip>

namespace UI {

    inline bool hex_to_floats(const std::string& hexString, float outColor[3]) {
        if (hexString.size() != 7 || hexString[0] != '#') {
            return false; // Invalid format
        }

        int r, g, b;
        sscanf(hexString.c_str(), "#%02x%02x%02x", &r, &g, &b);

        outColor[0] = r / 255.0f;
        outColor[1] = g / 255.0f;
        outColor[2] = b / 255.0f;

        return true;
    }

	inline void print_vector(const char* _name, const glm::vec3& _vec) {
		ImGui::Text(_name);
		ImGui::Text("(%.2f, %.2f, %.2f)", _vec.x, _vec.y, _vec.z);
	}
}