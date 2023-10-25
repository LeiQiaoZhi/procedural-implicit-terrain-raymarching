#pragma once

#include <glad/glad.h>

class EBO {
public:
	GLuint ID;
	
	// we need size because vertices is a pointer, not an array
	EBO(GLuint* _indices, GLsizeiptr _size);
	// rule of five
	~EBO();
	EBO(const EBO&) = delete;
	EBO& operator=(const EBO&) = delete;		
	EBO(EBO&&) = delete;
	EBO& operator=(EBO&&) = delete;

	void bind();
	void unbind();
};

