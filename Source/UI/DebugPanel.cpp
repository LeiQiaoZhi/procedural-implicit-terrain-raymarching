#include "DebugPanel.h"

void UI::DebugPanel::gui()
{
	auto& renderTargetSelect = properties_[0];
    if (auto specificProp = dynamic_cast<SingleSelectProperty*>(renderTargetSelect.get())) {
        std::string selectedStr = specificProp->get_selected_str();
        if (selectedStr == "Noise3D") {
            if (ImGui::SliderFloat("Noise3D", &noise3D_z_, 0.0f, 10.0f)) {
                shader_.set_uniform_float("iDebugNoise3DZ", noise3D_z_);
			}
        }
    }
    else {
        std::cout << "Cast to SingleSelectProperty failed." << std::endl;
    }
}
