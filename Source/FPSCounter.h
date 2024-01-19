#pragma once
#include "UI/PerformancePanel.h"
#include <GLFW/glfw3.h>

class FPSCounter {
public:
	FPSCounter(GLFWwindow* _window, std::shared_ptr<UI::PerformancePanel> _performance_panel)
		: window_(_window), performance_panel_(_performance_panel) {}

	void count_fps();
	void display_fps(double _fps, double _ms_per_frame);

private:
	GLFWwindow* window_;
	double previous_time_ = 0.0;
	double count_interval_ = 0.5;
	unsigned int frame_count_ = 0;

	std::shared_ptr<UI::PerformancePanel> performance_panel_;
};