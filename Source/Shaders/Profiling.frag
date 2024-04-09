// uniforms
uniform bool  iProfileUseCustomMax;
uniform float iProfileCustomMax;
uniform bool  iProfileMarkTrueMaxColor;
uniform bool  iProfileRaymarchSteps;
uniform bool  iProfileShadowSteps;
uniform bool  iProfileCloudRaymarchSteps;
uniform bool  iProfileTreeRaymarchSteps;
uniform bool  iProfileLastStepSize;
uniform bool  iProfileRaymarchPrecision;
uniform bool  iProfilePlanetRaymarchSteps;
// colors
uniform vec3 iProfileTrueMaxColor;
uniform vec3 iProfileRaymarchStepsMinColor;
uniform vec3 iProfileRaymarchStepsMaxColor;

#include "ProfilingHeader.frag"
#include "Raymarching.frag"
#include "Clouds.frag"
#include "Tree.frag"

vec3 lerp_color(
    in float _x, 
    in float _max
) {
    if (iProfileUseCustomMax) _max = iProfileCustomMax;
    
    return (iProfileMarkTrueMaxColor && _x >= _max)
    ? iProfileTrueMaxColor 
    : mix(iProfileRaymarchStepsMinColor, iProfileRaymarchStepsMaxColor, float(_x) / (_max)); 
}


bool show_profile_colors(
    inout vec3 _color_
)
{
    if (iProfileRaymarchSteps){
       _color_ = lerp_color(gTerrainRaymarchSteps, iMaxSteps);
    }
    else if (iProfileShadowSteps){
       _color_ = lerp_color(gTerrainShadowSteps, iTerrainShadowSteps);
    }
    else if (iProfileCloudRaymarchSteps){
       _color_ = lerp_color(gCloudRaymarchSteps, iCloudRaymarchSteps);
    }
    else if (iProfileTreeRaymarchSteps){
       _color_ = lerp_color(gTreeRaymarchSteps, iTreeSteps);
    }
    else if (iProfileLastStepSize){
        _color_ = lerp_color(gLastStepSize, iMaxStepSize);
    }
    else if (iProfileRaymarchPrecision){
        _color_ = lerp_color(gRaymarchPrecision, iProfileCustomMax);
    }
    if (iProfilePlanetRaymarchSteps){
       _color_ = lerp_color(gPlanetRaymarchSteps, iMaxSteps);
    }
    else{
        return false;
    }
    return true;
}