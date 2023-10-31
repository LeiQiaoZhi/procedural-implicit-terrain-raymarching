#pragma once

#include<glad/glad.h>
#include<string>
#include<fstream>
#include<sstream>
#include <filesystem>
#include<iostream>
#include<cerrno>
#include<glm/glm.hpp>

class Shader {
public:
	GLuint program_ID;

	Shader();
	Shader(const char* _vertex_file, const std::vector<const char*>& _frag_file);
	~Shader();

	void activate();

	void set_uniform_vec2(const std::string& name, const glm::vec2& value) const;
	void set_uniform_vec3(const std::string& name, const glm::vec3& value) const;
	void set_uniform_float(const std::string& name, const float value) const;
	void set_uniform_int(const std::string& name, const int value) const;
};
