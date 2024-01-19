#include "FPSCounter.h"
#include <sstream>
#include <iomanip>
#include <iostream>

void FPSCounter::count_fps()
{
	double current_time = glfwGetTime();
	double time_diff = current_time - previous_time_;
	frame_count_++;
	if (time_diff >= count_interval_) {
		double fps = static_cast<double>(frame_count_) / time_diff;
		double ms_per_frame = time_diff * 1000.0 / static_cast<double>(frame_count_);
		display_fps(fps, ms_per_frame);
		previous_time_ = current_time;
		frame_count_ = 0;
	}
}

void FPSCounter::display_fps(double _fps, double _ms_per_frame)
{
	std::ostringstream stream;
	stream << std::fixed << std::setprecision(2);
	stream << "FPS: " << _fps << " - Frame Time: " << _ms_per_frame << " ms";

	std::string fps_str = stream.str();
	//std::cout << fps_str << std::endl;
	performance_panel_->set_fps_str(fps_str);
	glfwSetWindowTitle(window_, fps_str.data());
}
