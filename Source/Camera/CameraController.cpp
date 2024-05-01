#include <imgui.h>
#include <iostream>

#include "CameraController.h"

void CameraController::set_callbacks(CallbackManager& _callback_manager)
{
	_callback_manager.register_scroll_callback([this](GLFWwindow* _window, double _x_offset, double _y_offset) {
		scroll_callback(_window, _x_offset, _y_offset);
		});
}

void CameraController::handle_inputs(GLFWwindow* _window, const int _width, const int _height)
{
	if (ImGui::IsWindowHovered(ImGuiHoveredFlags_AnyWindow) ||
		ImGui::IsAnyItemActive() || ImGui::IsAnyItemHovered()
		)
		return;

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

	// calculate delta time
	float current_frame_time = glfwGetTime();
	float delta_time = 100 * (current_frame_time - last_frame_time_);
	last_frame_time_ = current_frame_time;

	float min_dimension = std::min(_width, _height);
	float dx = (settings.invert_x ? -1 : 1) * (last_x_ - x_pos) / min_dimension;
	float dy = (settings.invert_y ? -1 : 1) * (last_y_ - y_pos) / min_dimension;

	if (dx != 0 || dy != 0) {
		// Handles mouse inputs
		if (glfwGetMouseButton(_window, GLFW_MOUSE_BUTTON_LEFT) == GLFW_PRESS) {
			if (settings.mode == 0)
				trackball_rotate(x_pos / min_dimension, y_pos / min_dimension, last_x_ / min_dimension, last_y_ / min_dimension);
			else
				orbit(dx * delta_time, dy * delta_time);
		}
		else if (glfwGetMouseButton(_window, GLFW_MOUSE_BUTTON_RIGHT) == GLFW_PRESS)
			pan(dx * delta_time, dy * delta_time);
		else if (glfwGetMouseButton(_window, GLFW_MOUSE_BUTTON_LEFT) == GLFW_RELEASE
			|| glfwGetMouseButton(_window, GLFW_MOUSE_BUTTON_MIDDLE) == GLFW_RELEASE)
			first_mouse_ = true;
	}

	// Handles keyboard inputs
	glm::vec2 input_direction{ 0,0 };
	int vertical_input = 0;
	if (glfwGetKey(_window, GLFW_KEY_W) == GLFW_PRESS)
		input_direction.y = 1;
	if (glfwGetKey(_window, GLFW_KEY_S) == GLFW_PRESS)
		input_direction.y = -1;
	if (glfwGetKey(_window, GLFW_KEY_A) == GLFW_PRESS)
		input_direction.x = -1;
	if (glfwGetKey(_window, GLFW_KEY_D) == GLFW_PRESS)
		input_direction.x = 1;
	if (glfwGetKey(_window, GLFW_KEY_E) == GLFW_PRESS)
		vertical_input = 1;
	if (glfwGetKey(_window, GLFW_KEY_Q) == GLFW_PRESS)
		vertical_input = -1;

	if (input_direction.x != 0 || input_direction.y != 0)
		camera_->move_foward_right(
			input_direction.y * settings.keyboard_speed * delta_time,
			input_direction.x * settings.keyboard_speed * delta_time);
	if (vertical_input != 0){
		if (settings.mode == 1)
			camera_->move_along_y(vertical_input * settings.keyboard_speed * delta_time);
		else
			camera_->move_right_up(0, vertical_input * settings.keyboard_speed * delta_time);
	}

	last_x_ = x_pos;
	last_y_ = y_pos;

}

void CameraController::pan(float _dx, float _dy)
{
	camera_->move_right_up(-_dx * settings.move_speed, _dy * settings.move_speed);
}

void CameraController::scroll_callback(GLFWwindow* _window, double _x_offset, double _y_offset)
{
	zoom((settings.invert_zoom ? -1 : 1) * glm::sign(_y_offset));
}

void CameraController::set_shader_uniforms(Shader& _shader)
{
	_shader.set_uniform_vec3("iCameraPos", get_position());
	_shader.set_uniform_vec3("iCameraFwd", get_forward());
	_shader.set_uniform_vec3("iCameraUp", get_up());
	_shader.set_uniform_vec3("iCameraRight", get_right());
	_shader.set_uniform_float("iFocalLength", camera_->get_focal_length());
}

// camera_position change
// target, target_distance, camera_direction does not change
void CameraController::zoom(float _zoom_factor)
{
	// positional zoom
	//auto new_pos = camera_->get_position() + _zoom_factor * settings.zoom_speed * camera_->get_forward();
	//camera_->set_position(new_pos);

	// focal length zoom
	auto new_focal_length = camera_->get_focal_length() + _zoom_factor * settings.zoom_speed;
	camera_->set_focal_length(new_focal_length);
}


// camera_position, camera_direction change
// target, target_distance does not change
void CameraController::orbit(float _angle_x, float _angle_y)
{
	// rotation matrices
	glm::mat4 rot_x = glm::mat4(1.0f);
	//rot_x = glm::rotate(rot_x, _angle_x * settings.rotate_speed, glm::vec3(0.0f, 1.0f, 0.0f));
	rot_x = glm::rotate(rot_x, _angle_x * settings.rotate_speed, get_up());
	glm::mat4 rot_y = glm::mat4(1.0f);
	rot_y = glm::rotate(rot_y, _angle_y * settings.rotate_speed, get_right());

	// apply rotation
	glm::vec4 new_forward = rot_x * rot_y * glm::vec4(camera_->get_forward(), 1.0f);
	glm::vec4 new_up = rot_x * rot_y * glm::vec4(camera_->get_up(), 1.0f);
	camera_->set_direction(glm::vec3(new_forward), glm::vec3(new_up));

	// update camera position
	auto new_position = get_target() - target_distance_ * camera_->get_forward();
	camera_->set_position(new_position);
}


void CameraController::trackball_rotate(float _x, float _y, float _last_x, float _last_y)
{
	// use origin as center for planets
	glm::vec3 center = glm::vec3(0.0f);

	if ((_x == _last_x) && (_y == _last_y))
		return;

	// get trackball positions
	auto pos1 = glm::vec3(mouse_to_trackball_pos(-_last_x, _last_y));
	auto pos2 = glm::vec3(mouse_to_trackball_pos(-_x, _y));
	glm::vec3 rot_axis = glm::normalize(glm::cross(pos1, pos2));

	// axis to world pos
	rot_axis =
		rot_axis.x * get_right() +
		rot_axis.y * get_up() +
		rot_axis.z * get_forward();

	float rot_angle =
		settings.trackball_radius *
		glm::distance(glm::vec2(_x, _y), glm::vec2(_last_x, _last_y)) *
		settings.rotate_speed;

	// rotate
	auto rot = glm::rotate(glm::mat4(1.0f), rot_angle, rot_axis);
	auto up_to_center = center - (get_position() + get_up());
	auto new_fwd = glm::vec3(rot * glm::vec4(get_forward(), 1.0f));
	up_to_center = glm::vec3(rot * glm::vec4(up_to_center, 1.0f));

	auto new_pos = center - new_fwd * glm::length(get_position() - center);
	auto new_up = glm::normalize(-up_to_center + center - new_pos);
	// reinforce orthogonality
	auto new_right = glm::normalize(glm::cross(new_fwd, new_up));
	new_up = glm::normalize(glm::cross(new_right, new_fwd));

	camera_->set_position(new_pos);
	camera_->set_direction(new_fwd, new_up);
}


glm::vec3 CameraController::mouse_to_trackball_pos(float _x, float _y)
{
	float r2 = _x * _x + _y * _y;
	float t = 0.5f * settings.trackball_radius * settings.trackball_radius;

	glm::vec3 pos;
	pos.x = _x;
	pos.y = _y;
	if (r2 < t)
		pos.z = sqrtf(2.0f * t - r2);
	else
		pos.z = t / sqrtf(r2);

	return glm::normalize(pos);
}
