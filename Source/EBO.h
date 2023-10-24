#pragma once

#include <glad/glad.h>

class EBO {
public:
	GLuint ID;
	
	// we need size because vertices is a pointer, not an array
	EBO(GLuint* _indices, GLsizeiptr _size);

	void bind();
	void unbind();
	void delete_buffer();

};

