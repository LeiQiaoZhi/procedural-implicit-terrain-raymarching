#include "Camera.h"

void Camera::move(float _d_right, float _d_up)
{
	position_ += _d_right * glm::normalize(glm::cross(forward_, up_));
	position_ += _d_up * up_;
}
