#pragma once
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>

// Reponsibilities:
// 1. Stores states
// 2. Calculates view and proj matrices (don't need for now)
class Camera
{
protected:
	// states
	glm::vec3 position_;
	glm::vec3 forward_ = glm::vec3(0.0f, 0.0f, 1.0f);
	glm::vec3 up_ = glm::vec3(0.0f, 1.0f, 0.0f);
	float focal_length_ = 2.0f;

public:
	Camera(glm::vec3 _position) : position_(_position) {}
	Camera(glm::vec3 _position, glm::vec3 _forward, glm::vec3 _up) : position_(_position), forward_(_forward), up_(_up) {}

	// getters
	glm::vec3 get_position() { return position_; }
	glm::vec3& get_position_ref() { return position_; }
	glm::vec3 get_forward() { return glm::normalize(forward_); }
	glm::vec3 get_up() { return glm::normalize(up_); }
	glm::vec3 get_right() { return glm::normalize(glm::cross(forward_, up_)); }
	float get_focal_length() { return focal_length_; }

	// state changers
	void move_along_y(float _d_up);
	void move_right_up(float _d_right, float _d_up);
	void move_foward_right(float _d_forward, float _d_right);
	void set_direction(glm::vec3 _forward, glm::vec3 _up) { forward_ = _forward; up_ = _up; }
	void set_position(glm::vec3 _position) { position_ = _position; }
	void set_focal_length(float _focal_length) { focal_length_ = glm::clamp(_focal_length, 1.0f, 100.0f); }

};
