#pragma once

#include <glad/glad.h>
#include "VBO.h"

class VAO {
public:
	GLuint ID;
	VAO();
	// rule of five
	~VAO();
	VAO(const VAO&) = delete;
	VAO& operator=(const VAO&) = delete;
	VAO(VAO&&) = delete;
	VAO& operator=(VAO&&) = delete;

	void link_attrib(VBO& _vbo, GLuint _layout, GLuint _num_components, GLenum _type, GLsizeiptr _stride, void* _offset);
	void bind();
	void unbind();
};
