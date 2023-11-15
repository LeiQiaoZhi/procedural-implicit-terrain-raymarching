#include "Camera.h"

void Camera::move_along_y(float _d_up)
{
	position_ += _d_up * glm::vec3(0.0f, 1.0f, 0.0f);
}

void Camera::move_right_up(float _d_right, float _d_up)
{
	position_ += _d_right * glm::normalize(glm::cross(forward_, up_));
	position_ += _d_up * up_;
}

void Camera::move_foward_right(float _d_forward, float _d_right)
{
	position_ += _d_forward * forward_;
	position_ += _d_right * glm::normalize(glm::cross(forward_, up_));
}