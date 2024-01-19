#include "ShaderClass.h"
#include <regex>
#include <set>

namespace
{
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

	void check_shader_compilation(GLint _shader)
	{
		GLint success;
		GLchar infoLog[512];

		glGetShaderiv(_shader, GL_COMPILE_STATUS, &success);
		if (!success)
		{
			glGetShaderInfoLog(_shader, 512, NULL, infoLog);
			std::cerr << "ERROR::SHADER::COMPILATION_FAILED\n" << infoLog << std::endl;
		}
		else
			std::cout << "Shader compiled successfully." << std::endl;
	}

	void process_includes(std::string& file_content)
	{
		// create a set for processed includes to avoid infinite recursion
		std::set<std::string> processed_includes;
		const std::regex include_regex("#include \"(.*)\"");
		std::smatch include_match;

		while (std::regex_search(file_content, include_match, include_regex))
		{
			const std::string match_path = include_match[1].str();
			if (processed_includes.find(match_path) == processed_includes.end())
			{
				const std::string include_file_path = SHADER_PATH + std::string("/") + match_path;
				const std::string include_file_contents = get_file_contents(include_file_path.c_str());
				file_content.replace(include_match.position(), include_match.length(), include_file_contents);
				processed_includes.insert(match_path);
			}
			else
			{
				std::cout << "WARNING: Shader include " << match_path << " already processed. Skipping." << std::endl;
				file_content.erase(include_match.position(), include_match.length());
			}
		}
	}

	void substitute_uniforms_in_frag(std::string& _frag_source, nlohmann::json& _glsl_json) {
		std::istringstream stream(_frag_source);
		std::string line;
		std::string result;
		while (std::getline(stream, line)) {
			if (line.rfind("uniform", 0) == 0) { // Check if the line starts with "uniform"
				std::istringstream lineStream(line);
				std::string uniform, type, varName;

				lineStream >> uniform >> type >> varName; // Extracting uniform, type, and varName
				varName.pop_back(); // Remove the trailing ';' from varName

				if (_glsl_json.contains(varName)) {
					// Replace "uniform" with "const" and append the value from _glsl_json
					std::string value = _glsl_json[varName];
					//result += "const " + type + " " + varName + " = " + value + ";\n";
					result += "#define " + varName + " (" + value + ")\n";
				}
				else {
					// If the varName is not in _glsl_json, keep the line as is
					result += line + "\n";
				}
			}
			else {
				// For lines that do not start with "uniform"
				result += line + "\n";
			}
		}

		_frag_source = std::move(result);
	}
}

Shader::Shader(const char* _vertex_file, const std::vector<const char*>& _frag_files)
{
	// A single vertex shader
	std::string vertex_code = get_file_contents(_vertex_file);
	vertex_code_ = vertex_code;
	const char* vertex_source = vertex_code.c_str();

	GLuint vertex_shader = glCreateShader(GL_VERTEX_SHADER);
	glShaderSource(vertex_shader, 1, &vertex_source, NULL);
	glCompileShader(vertex_shader);
	check_shader_compilation(vertex_shader);

	// Shader program
	program_ID = glCreateProgram();
	glAttachShader(program_ID, vertex_shader);
	glDeleteShader(vertex_shader);

	std::string combined_frag_code = "";
	// Multiple fragment shaders
	for (const char* frag_file : _frag_files)
	{
		std::string frag_code = get_file_contents(frag_file);
		combined_frag_code += frag_code;
	}

	process_includes(combined_frag_code);
	frag_code_ = combined_frag_code;
	const char* frag_source = combined_frag_code.c_str();

	GLuint frag_shader = glCreateShader(GL_FRAGMENT_SHADER);
	glShaderSource(frag_shader, 1, &frag_source, NULL);
	glCompileShader(frag_shader);
	check_shader_compilation(frag_shader);

	glAttachShader(program_ID, frag_shader);
	glDeleteShader(frag_shader);

	glLinkProgram(program_ID);
}

Shader::~Shader()
{
	glDeleteProgram(program_ID);
}

void Shader::activate()
{
	glUseProgram(program_ID);
}

void Shader::substitute_uniforms(nlohmann::json& _glsl_json)
{
	glDeleteProgram(program_ID);

	substitute_uniforms_in_frag(frag_code_, _glsl_json);
	std::cout << frag_code_ << std::endl;

	const char* vertex_source = vertex_code_.c_str();

	GLuint vertex_shader = glCreateShader(GL_VERTEX_SHADER);
	glShaderSource(vertex_shader, 1, &vertex_source, NULL);
	glCompileShader(vertex_shader);
	check_shader_compilation(vertex_shader);

	// Shader program
	program_ID = glCreateProgram();
	glAttachShader(program_ID, vertex_shader);
	glDeleteShader(vertex_shader);

	const char* frag_source = frag_code_.c_str();

	GLuint frag_shader = glCreateShader(GL_FRAGMENT_SHADER);
	glShaderSource(frag_shader, 1, &frag_source, NULL);
	glCompileShader(frag_shader);
	check_shader_compilation(frag_shader);

	glAttachShader(program_ID, frag_shader);
	glDeleteShader(frag_shader);

	glLinkProgram(program_ID);
}

void Shader::set_uniform_vec2(const std::string& name, const glm::vec2& value) const
{
	GLint location = glGetUniformLocation(program_ID, name.c_str());
	glUniform2f(location, value.x, value.y);
}

void Shader::set_uniform_vec3(const std::string& name, const glm::vec3& value) const
{
	GLint location = glGetUniformLocation(program_ID, name.c_str());
	glUniform3f(location, value.x, value.y, value.z);
}

void Shader::set_uniform_float(const std::string& name, float value) const
{
	GLint location = glGetUniformLocation(program_ID, name.c_str());
	glUniform1f(location, value);
}

void Shader::set_uniform_int(const std::string& name, int value) const
{
	GLint location = glGetUniformLocation(program_ID, name.c_str());
	glUniform1i(location, value);
}

void Shader::set_uniform_bool(const std::string& name, bool value) const
{
	GLint location = glGetUniformLocation(program_ID, name.c_str());
	glUniform1i(location, value);
}

