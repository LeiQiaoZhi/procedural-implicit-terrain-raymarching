#include "CameraPanel.h"

void UI::CameraPanel::gui() 
{
	if (init_) {
		init_ = false;
	}

	// show camera information
	print_vector("Position", camera_.get_position());
	print_vector("Forward", camera_.get_forward());
	print_vector("Up", camera_.get_up());
	print_vector("Right", camera_.get_right());
}
