// uniforms
uniform bool iProfileRaymarchSteps;
uniform bool iProfileShadowSteps;
uniform vec3 iProfileRaymarchStepsMinColor;
uniform vec3 iProfileRaymarchStepsMaxColor;

#include "ProfilingHeader.frag"
#include "Raymarching.frag"

vec3 get_raymarch_steps_profile_color() {
    vec3 color = mix(
            iProfileRaymarchStepsMinColor,
            iProfileRaymarchStepsMaxColor,
            float(gTerrainRaymarchSteps) / iMaxSteps
        );
    return color;
}

vec3 get_shadow_steps_profile_color() {
    vec3 color = mix(
            iProfileRaymarchStepsMinColor,
            iProfileRaymarchStepsMaxColor,
            float(gTerrainShadowSteps) / iTerrainShadowSteps
        );
    return color;
}

bool show_profile_colors(
    inout vec3 _color_
)
{
    if (!iProfileRaymarchSteps && !iProfileShadowSteps)
        return false;

    if (iProfileRaymarchSteps)
       _color_ = get_raymarch_steps_profile_color();
    if (iProfileShadowSteps)
       _color_ = get_shadow_steps_profile_color();

    return true;
}