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

	constexpr float VERTICES_WITH_TEX[] = {
		// positions   // texCoords
		-1.0f,  1.0f,  0.0f, 1.0f,
		-1.0f, -1.0f,  0.0f, 0.0f,
		 1.0f, -1.0f,  1.0f, 0.0f,
		 1.0f,  1.0f,  1.0f, 1.0f
	};


	constexpr unsigned int INDICES[] = {
		0, 1, 2,   // First triangle
		2, 3, 0    // Second triangle
	};

	// ANSI escape codes for some colors
	const std::string RED = "\033[31m";
	const std::string GREEN = "\033[32m";
	const std::string YELLOW = "\033[33m";
	const std::string BLUE = "\033[34m";
	const std::string MAGENTA = "\033[35m";
	const std::string CYAN = "\033[36m";
	const std::string RESET = "\033[0m"; // Resets the color
}