#include "CameraController.h"
#include <iostream>


void CameraController::handle_inputs(GLFWwindow* _window, const int _width, const int _height)
{

	glfwSetWindowUserPointer(_window, this);
	// use lambda
	glfwSetScrollCallback(_window, [](GLFWwindow* _window, double _x_offset, double _y_offset) {
		static_cast<CameraController*>(glfwGetWindowUserPointer(_window))->scroll_callback(_window, _x_offset, _y_offset);
		});
	// get mouse pos
	double x_pos, y_pos;
	glfwGetCursorPos(_window, &x_pos, &y_pos);

	if (first_mouse_)
	{
		last_x_ = x_pos;
		last_y_ = y_pos;
		first_mouse_ = false;
		return;
	}

	float min_dimension = std::min(_width, _height);
	float dx = -(int)invert_x_ * (x_pos - last_x_) / min_dimension;
	float dy = -(int)invert_y_ * (last_y_ - y_pos) / min_dimension;

	if (dx == 0 && dy == 0)
		return;

	// Handles mouse inputs
	if (glfwGetMouseButton(_window, GLFW_MOUSE_BUTTON_LEFT) == GLFW_PRESS)
		orbit(dx, dy);
	else if (glfwGetMouseButton(_window, GLFW_MOUSE_BUTTON_MIDDLE) == GLFW_PRESS)
		pan(dx, dy);
	else if (glfwGetMouseButton(_window, GLFW_MOUSE_BUTTON_LEFT) == GLFW_RELEASE
		|| glfwGetMouseButton(_window, GLFW_MOUSE_BUTTON_MIDDLE) == GLFW_RELEASE)
		first_mouse_ = true;

	last_x_ = x_pos;
	last_y_ = y_pos;
}

void CameraController::pan(float _dx, float _dy)
{
	//std::cout << "pan x:" << _dx << " y:" << _dy << std::endl;
	camera_->move(_dx * move_speed_, _dy * move_speed_);
}

void CameraController::scroll_callback(GLFWwindow* _window, double _x_offset, double _y_offset)
{
	zoom(1 + -glm::sign(_y_offset) * zoom_speed_);
}

// camera_position change
// target, target_distance, camera_direction does not change
void CameraController::zoom(float _zoom_factor)
{
	auto new_pos = camera_->get_position() + ((_zoom_factor<1)?10.0f:-10.0f) * camera_->get_forward();
	camera_->set_position(new_pos);
}

// camera_position, camera_direction change
// target, target_distance does not change
void CameraController::orbit(float _angle_x, float _angle_y)
{
	// rotation matrices
	glm::mat4 rot_x = glm::mat4(1.0f);
	rot_x = glm::rotate(rot_x, _angle_x * rotate_speed_, glm::vec3(0.0f, 1.0f, 0.0f));
	glm::mat4 rot_y = glm::mat4(1.0f);
	rot_y = glm::rotate(rot_y, _angle_y * rotate_speed_, camera_->get_right());

	// apply rotation
	glm::vec4 new_forward = rot_x * rot_y * glm::vec4(camera_->get_forward(), 1.0f);
	glm::vec4 new_up = rot_x * rot_y * glm::vec4(camera_->get_up(), 1.0f);
	camera_->set_direction(glm::vec3(new_forward), glm::vec3(new_up));
	
	// update camera position
	auto new_position = get_target() - target_distance_ * camera_->get_forward();
	camera_->set_position(new_position);

}
