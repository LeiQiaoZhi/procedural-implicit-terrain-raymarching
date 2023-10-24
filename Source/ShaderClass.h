#pragma once

#include<glad/glad.h>
#include<string>
#include<fstream>
#include<sstream>
#include<iostream>
#include<cerrno>

std::string get_file_contents(const char* filename);

class Shader {
public:
	GLuint program_ID;

	Shader(const char* vertexFile, const char* fragFile);

	void activate();
	void delete_shader();
};
