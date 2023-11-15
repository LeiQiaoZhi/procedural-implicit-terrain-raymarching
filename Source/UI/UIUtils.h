#pragma once
#include <imgui.h>
#include <glm/glm.hpp>
#include <string>
#include <iostream>
#include <sstream>
#include <iomanip>
#include <Windows.h>
#include <commdlg.h>
#include <tchar.h>

namespace UI {

	inline bool hex_to_floats(const std::string& hexString, float outColor[3]) {
		if (hexString.size() != 7 || hexString[0] != '#') {
			return false; // Invalid format
		}

		int r, g, b;
		sscanf(hexString.c_str(), "#%02x%02x%02x", &r, &g, &b);

		outColor[0] = r / 255.0f;
		outColor[1] = g / 255.0f;
		outColor[2] = b / 255.0f;

		return true;
	}

	inline void print_vector(const char* _name, const glm::vec3& _vec) {
		ImGui::Text(_name);
		ImGui::Text("(%.2f, %.2f, %.2f)", _vec.x, _vec.y, _vec.z);
	}

	inline std::string win_file_select(std::string _title = "Select a Config File") {
		OPENFILENAME ofn;       // common dialog box structure
		TCHAR szFile[260] = { 0 }; // buffer for file name
		HWND hwnd = NULL;      // owner window
		HANDLE hf;             // file handle

		// Initialize OPENFILENAME
		ZeroMemory(&ofn, sizeof(ofn));
		ofn.lStructSize = sizeof(ofn);
		ofn.hwndOwner = hwnd;
		ofn.lpstrFile = szFile;
		ofn.nMaxFile = sizeof(szFile);
		ofn.lpstrFilter = _T("JSON\0*.JSON\0All\0*.*\0");
		ofn.nFilterIndex = 1;
		ofn.lpstrFileTitle = NULL;
		ofn.nMaxFileTitle = 0;
		ofn.lpstrInitialDir = _T(CONFIG_PATH);
		ofn.lpstrTitle = _title.c_str();
		ofn.Flags = OFN_PATHMUSTEXIST | OFN_FILEMUSTEXIST;

		// Display the Open dialog box.
		if (GetOpenFileName(&ofn) == TRUE) {
			hf = CreateFile(ofn.lpstrFile,
				GENERIC_READ,
				0,
				(LPSECURITY_ATTRIBUTES)NULL,
				OPEN_EXISTING,
				FILE_ATTRIBUTE_NORMAL,
				(HANDLE)NULL);
			if (hf != INVALID_HANDLE_VALUE) {
				CloseHandle(hf);
				return szFile;
			}
		}
		return std::string(); // return empty string if failed or canceled
	}
}