#include "EBO.h"

EBO::EBO(GLuint* _indices, GLsizeiptr _size)
{
	glGenBuffers(1, &ID);
	bind();
	glBufferData(GL_ELEMENT_ARRAY_BUFFER, _size, _indices, GL_STATIC_DRAW);
}

EBO::~EBO()
{
	glDeleteBuffers(1, &ID);
}

// make the buffer known as the active EBO
void EBO::bind()
{
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ID);
}

void EBO::unbind()
{
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
}
