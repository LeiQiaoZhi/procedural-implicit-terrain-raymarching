#pragma once

#include <glad/glad.h>

class VBO {
public:
	GLuint ID;
	
	// we need size because vertices is a pointer, not an array
	VBO(GLfloat* _vertices, GLsizeiptr _size);
	// rule of five
	~VBO();
	VBO(const VBO&) = delete;
	VBO& operator=(const VBO&) = delete;
	VBO(VBO&&) = delete;
	VBO& operator=(VBO&&) = delete;

	void bind();
	void unbind();
};
