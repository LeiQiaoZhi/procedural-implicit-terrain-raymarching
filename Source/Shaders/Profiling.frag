// uniforms
uniform bool iProfileRaymarchSteps;
uniform bool iProfileShadowSteps;
uniform bool iProfileCloudRaymarchSteps;
uniform bool iProfileTreeRaymarchSteps;
// colors
uniform vec3 iProfileRaymarchStepsMinColor;
uniform vec3 iProfileRaymarchStepsMaxColor;

#include "ProfilingHeader.frag"
#include "Raymarching.frag"
#include "Clouds.frag"
#include "Tree.frag"

#define LERP_COLOR(_x, _max) mix(iProfileRaymarchStepsMinColor, iProfileRaymarchStepsMaxColor, float(_x) / (_max)); return true

bool show_profile_colors(
    inout vec3 _color_
)
{
    if (iProfileRaymarchSteps){
       _color_ = LERP_COLOR(gTerrainRaymarchSteps, iMaxSteps);
    }
    if (iProfileShadowSteps){
       _color_ = LERP_COLOR(gTerrainShadowSteps, iTerrainShadowSteps);
    }
    if (iProfileCloudRaymarchSteps){
       _color_ = LERP_COLOR(gCloudRaymarchSteps, iCloudRaymarchSteps);
    }
    if (iProfileTreeRaymarchSteps){
       _color_ = LERP_COLOR(gTreeRaymarchSteps, iTreeSteps);
    }

    return false;
}