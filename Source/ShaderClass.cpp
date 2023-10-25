#include "shaderClass.h"
#include <filesystem>

// Reads a text file and outputs a string with everything in the text file
std::string get_file_contents(const char* _filename)
{
	std::filesystem::path absolute_path = std::filesystem::current_path() / _filename;
	std::cout << "Reading shader file from " << absolute_path << std::endl;
	std::ifstream in(absolute_path, std::ios::binary);

	if (!in) {
		throw std::runtime_error("Error reading shader file: " 
			+ absolute_path.string());
	}

	if (in)
	{
		std::string contents;
		in.seekg(0, std::ios::end);
		contents.resize(in.tellg());
		in.seekg(0, std::ios::beg);
		in.read(&contents[0], contents.size());
		in.close();
		return(contents);
	}
	throw(errno);
}

Shader::Shader(const char* _vertex_file, const char* _frag_file) 
{
	// Read vertexFile and fragmentFile and store the strings
	std::string vertex_code = get_file_contents(_vertex_file);
	std::string frag_code = get_file_contents(_frag_file);

	// Convert the shader source strings into character arrays
	const char* vertex_source = vertex_code.c_str();
	const char* frag_source = frag_code.c_str();

	// Shader compilation 
	GLuint vertex_shader = glCreateShader(GL_VERTEX_SHADER);
	glShaderSource(vertex_shader, 1, &vertex_source, NULL);
	glCompileShader(vertex_shader);

	GLuint frag_shader = glCreateShader(GL_FRAGMENT_SHADER);
	glShaderSource(frag_shader, 1, &frag_source, NULL);
	glCompileShader(frag_shader);

	// Shader program
	program_ID = glCreateProgram();
	glAttachShader(program_ID, vertex_shader);
	glAttachShader(program_ID, frag_shader);
	glLinkProgram(program_ID);

	// Delete the shaders as the program has them now
	glDeleteShader(vertex_shader);
	glDeleteShader(frag_shader);

}

Shader::~Shader()
{
	glDeleteProgram(program_ID);
}

void Shader::activate() 
{
	glUseProgram(program_ID);
}

void Shader::set_uniform_vec2(const std::string& name, const glm::vec2& value) const
{
	GLint location = glGetUniformLocation(program_ID, name.c_str());
	glUniform2f(location, value.x, value.y);
}

