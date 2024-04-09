#include "FBO.h"
#include <iostream>

FBO::FBO(GLsizei _width, GLsizei _height)
{
	glGenFramebuffers(1, &ID);

	// generate texture attachment
	glGenTextures(1, &texture);
	glBindTexture(GL_TEXTURE_2D, texture);

	glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, _width, _height, 0, GL_RGBA, GL_UNSIGNED_BYTE, 0);

	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);

	// attach the texture to the framebuffer
	bind();
	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, texture, 0);

	// check if the framebuffer is complete
	if (glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE)
	{
		std::cout << "Framebuffer is not complete!" << std::endl;
	}
}

FBO::~FBO()
{
	glDeleteFramebuffers(1, &ID);
	glDeleteTextures(1, &texture);
}

// make it the active FBO
void FBO::bind()
{
	glBindFramebuffer(GL_FRAMEBUFFER, ID);
}

// unbind the active FBO, make the default FBO active
void FBO::unbind()
{
	glBindFramebuffer(GL_FRAMEBUFFER, 0);
}
