#pragma once

#include <glad/glad.h>
#include <string>
#include <fstream>
#include <sstream>
#include <filesystem>
#include <iostream>
#include <cerrno>
#include <glm/glm.hpp>

class Shader {
public:
	GLuint program_ID;

	Shader(const char* _vertex_file, const std::vector<const char*>& _frag_file);
	~Shader();

	void activate();

	void set_uniform_vec2(const std::string& name, const glm::vec2& value) const;
	void set_uniform_vec3(const std::string& name, const glm::vec3& value) const;
	void set_uniform_float(const std::string& name, float value) const;
	void set_uniform_int(const std::string& name, int value) const;
	void set_uniform_bool(const std::string& name, bool value) const;
};
