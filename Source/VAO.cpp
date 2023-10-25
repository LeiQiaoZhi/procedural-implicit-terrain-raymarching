#include "VAO.h"

VAO::VAO()
{
	glGenVertexArrays(1, &ID);
}

VAO::~VAO()
{
	glDeleteVertexArrays(1, &ID);
}

void VAO::link_attrib(VBO& _vbo, GLuint _layout, GLuint _num_components, GLenum _type, GLsizeiptr _stride, void* _offset)
{
	_vbo.bind();
	// provide vertex attribute from active VBO to shader at layout
	glVertexAttribPointer(_layout, _num_components, _type, GL_FALSE, _stride, _offset);
	glEnableVertexAttribArray(_layout);
	_vbo.unbind();
}

void VAO::bind()
{
	glBindVertexArray(ID);
}

void VAO::unbind()
{
	glBindVertexArray(0);
}
