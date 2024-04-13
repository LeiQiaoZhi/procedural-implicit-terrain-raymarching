#pragma once

#include <glad/glad.h>

class FBO {
public:
	GLuint ID;
	GLuint texture;
	
	// we need size because vertices is a pointer, not an array
	FBO(GLsizei _width, GLsizei _height);
	// rule of five
	~FBO();
	FBO(const FBO&) = delete;
	FBO& operator=(const FBO&) = delete;
	FBO(FBO&&) = delete;
	FBO& operator=(FBO&&) = delete;

	void bind();
	void unbind();

	void clear();
};
