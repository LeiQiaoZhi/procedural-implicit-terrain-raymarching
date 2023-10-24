#include "VBO.h"

VBO::VBO(GLfloat* _vertices, GLsizeiptr _size)
{
	glGenBuffers(1, &ID);
	bind();
	glBufferData(GL_ARRAY_BUFFER, _size, _vertices, GL_STATIC_DRAW);
}

// make the buffer known as a VBO
void VBO::bind()
{
	glBindBuffer(GL_ARRAY_BUFFER, ID);
}

void VBO::unbind()
{
	glBindBuffer(GL_ARRAY_BUFFER, 0);
}

void VBO::delete_buffer()
{
	glDeleteBuffers(1, &ID);
}
