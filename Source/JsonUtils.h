#pragma once
#include <nlohmann/json.hpp>
#include <glm/glm.hpp>
#include <fstream>

namespace JsonUtils {
	constexpr char* Default_Filename = "//default.json";

	inline nlohmann::json vec3_to_json_array(glm::vec3 _vec) {
		return nlohmann::json::array({ _vec.x, _vec.y, _vec.z });
	}

	inline glm::vec3 json_array_to_vec3(nlohmann::json _json) {
		return glm::vec3(_json[0], _json[1], _json[2]);
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

	inline void json_to_default(const nlohmann::json& _json) {
		json_to_file(_json, CONFIG_PATH + std::string(Default_Filename));
	}

	inline nlohmann::json json_from_default() {
		return json_from_file(CONFIG_PATH + std::string(Default_Filename));
	}

}