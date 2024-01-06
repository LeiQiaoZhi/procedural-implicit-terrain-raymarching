#pragma once

namespace Constants {

	constexpr int WIDTH = 640;
	constexpr int HEIGHT = 480;

	constexpr float VERTICES[] = {
		-1.0f,  1.0f, -1.0f,  // Top-left
		-1.0f, -1.0f, -1.0f,  // Bottom-left
		 1.0f, -1.0f, -1.0f,  // Bottom-right
		 1.0f,  1.0f, -1.0f,   // Top-right
	};

	constexpr unsigned int INDICES[] = {
		0, 1, 2,   // First triangle
		2, 3, 0    // Second triangle
	};
}