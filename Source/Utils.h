#pragma once

#include <glm/glm.hpp>

namespace SphericalCoords {
	inline glm::vec3 to_cartesian(float theta_, float phi_, float radius_) {
		return glm::vec3(
			radius_ * glm::sin(theta_) * glm::cos(phi_),
			radius_ * glm::sin(theta_) * glm::sin(phi_),
			radius_ * glm::cos(theta_)
		);
	}
}

namespace GLFWUtils {
	inline glm::vec2 get_framebuffer_size(GLFWwindow* window_) {
		int width, height;
		glfwGetFramebufferSize(window_, &width, &height);
		return glm::vec2(width, height);
	}

	inline glm::vec2 get_viewport_size(GLFWwindow* window_) {
		GLint viewport[4];
		glGetIntegerv(GL_VIEWPORT, viewport);
		const GLint width = viewport[2];
		const GLint height = viewport[3];
		return glm::vec2(width, height);
	}
}
