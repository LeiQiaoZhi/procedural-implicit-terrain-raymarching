#pragma once
#include <nlohmann/json.hpp>
#include <glm/glm.hpp>
#include <fstream>
#include <imgui.h>
#include <string>

namespace JsonUtils {
	constexpr char* Default_Config_Name = "//default.json";
	constexpr char* Default_Layout_Name = "//Layouts//layout.json";

	inline nlohmann::json vec3_to_json_array(glm::vec3 _vec) {
		return nlohmann::json::array({ _vec.x, _vec.y, _vec.z });
	}

	inline glm::vec3 json_array_to_vec3(nlohmann::json _json) {
		return glm::vec3(_json[0], _json[1], _json[2]);
	}

	inline nlohmann::json imvec2_to_json_array(ImVec2 _vec) {
		return nlohmann::json::array({ _vec.x, _vec.y });
	}

	inline ImVec2 json_array_to_imvec2(nlohmann::json _json) {
		return ImVec2(_json[0], _json[1]);
	}

	inline void json_to_file(const nlohmann::json& _json, const std::string& _path) {
        std::ofstream out_file(_path.c_str(), std::ofstream::out | std::ofstream::trunc);

        if (!out_file.is_open()) {
            std::cerr << "Failed to open " << _path << '\n';
            return;
        }

        out_file << _json.dump(4); 
        out_file.close();

        std::cout << "JSON saved to " << _path << '\n';
	}

	inline nlohmann::json json_from_file(const std::string& _path) {
		std::ifstream in_file(_path.c_str());

		if (!in_file.is_open()) {
			std::cerr << "Failed to open " << _path << '\n';
			return nlohmann::json();
		}

		nlohmann::json j = nlohmann::json::parse(in_file);
		in_file.close();

		std::cout << "JSON loaded from " << _path << '\n';

		return j;
	}

	inline void json_to_default_config(const nlohmann::json& _json) {
		json_to_file(_json, CONFIG_PATH + std::string(Default_Config_Name));
	}

	inline nlohmann::json json_from_default_config() {
		return json_from_file(CONFIG_PATH + std::string(Default_Config_Name));
	}

	inline void json_to_default_layout(const nlohmann::json& _json) {
		json_to_file(_json, CONFIG_PATH + std::string(Default_Layout_Name));
	}

	inline nlohmann::json json_from_default_layout() {
		return json_from_file(CONFIG_PATH + std::string(Default_Layout_Name));
	}

	inline std::string remove_json_extension(const std::string& _filename) {
		std::string result = _filename;
		std::string extension = ".json";

		// Find the position of ".json" in the string
		size_t pos = result.rfind(extension);

		// Check if ".json" was found and if it's at the end of the string
		if (pos != std::string::npos && pos == result.length() - extension.length()) {
			result.erase(pos, extension.length());
		}

		return result;
	}

}