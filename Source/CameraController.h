#pragma once
#include <glad/glad.h>	
#include <GLFW/glfw3.h>
#include "Camera.h"

class CameraController
{
private:
	Camera* camera_;

	// settings
	float move_speed_ = 1.0f;
	float rotate_speed_ = 1.0f;
	float zoom_speed_ = 0.1f; // between 0 and 1
	bool invert_x_ = true;
	bool invert_y_ = true;

	// states
	// TODO: assume target is always along fwd, use target_distance_ instead
	glm::vec3 target_ = glm::vec3(0.0f);
	bool first_mouse_ = true;
	double last_x_ = 0;
	double last_y_ = 0;

public:
	CameraController(Camera* _camera) : camera_(_camera) {}
	//CameraController(Camera* _camera, int _width, int _height) : camera_(_camera), width_(_width), height_(_height) {}

	void handle_inputs(GLFWwindow* _window, const int _width, const int _height);
	void scroll_callback(GLFWwindow* _window, double _x_offset, double _y_offset);

	// operations
	void pan(float _dx, float _dy);
	void orbit(float _angle_x, float _angle_y);
	void zoom(float zoom_factor);

	// queries
	glm::vec3 get_position() { return camera_->get_position(); }
};
