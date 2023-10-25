#pragma once

#include <glad/glad.h>
#include "VBO.h"

class VAO {
public:
	GLuint ID;
	VAO();
	~VAO();
	void link_attrib(VBO& _vbo, GLuint _layout, GLuint _num_components, GLenum _type, GLsizeiptr _stride, void* _offset);
	void bind();
	void unbind();
};
