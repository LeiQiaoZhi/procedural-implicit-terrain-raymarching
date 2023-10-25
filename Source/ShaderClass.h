#pragma once

#include<glad/glad.h>
#include<string>
#include<fstream>
#include<sstream>
#include<iostream>
#include<cerrno>
#include<glm/glm.hpp>

std::string get_file_contents(const char* filename);

class Shader {
public:
	GLuint program_ID;

	Shader(const char* vertexFile, const char* fragFile);

	void activate();
	void delete_shader();

	void set_uniform_vec2(const std::string& name, const glm::vec2& value) const;
};
