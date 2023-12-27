#pragma once

#include <glm/glm.hpp>

namespace SphericalCoords {
	glm::vec3 to_cartesian(float theta_, float phi_, float radius_) {
		return glm::vec3(
			radius_ * glm::sin(theta_) * glm::cos(phi_),
			radius_ * glm::sin(theta_) * glm::sin(phi_),
			radius_ * glm::cos(theta_)
		);
	}
}
