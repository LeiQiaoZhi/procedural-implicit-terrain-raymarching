#pragma once

#include <glad/glad.h>

class VBO {
public:
	GLuint ID;
	
	// we need size because vertices is a pointer, not an array
	VBO(GLfloat* _vertices, GLsizeiptr _size);

	void bind();
	void unbind();
	void delete_buffer();

};
