#include "Fbm.frag"

// color variety
uniform vec3 iWaterShallowColor;
uniform vec3 iWaterDeepColor;
uniform float iWaterTransmittanceDecay;
uniform float iWaterInitialTransparency;
uniform float iWaterTransparencyDecrease;
// lighting
uniform bool iWaterShadowOn;
uniform float iWaterFresnelNormalIncidence;
uniform int iWaterFresnelDotPower;
uniform int iWaterSpecularDotPower;
uniform float iWaterAmbientStrength;
uniform float iWaterDiffuseStrength;
uniform float iWaterSpecularStrength;
// fbm -- normal map
uniform float iWaterHorizontalScale;
uniform float iWaterMaxHeight;
uniform int iWaterNumLayers;
uniform float iWaterHorizontalShrink;
uniform float iWaterVerticalShrink;



vec3 water_normal_map(
	in vec3 _pos
) {
	vec3 result = fbm_d(
		_pos.xz / iWaterHorizontalScale,
		iWaterNumLayers,
		iWaterHorizontalShrink,
		0.5,
		iWaterVerticalShrink,
		vec2(1,1), -1
	);
	result *= iWaterMaxHeight;
	result.yz /= iWaterHorizontalScale;
	vec3 normal = normalize(vec3(-result.y, 1.0, -result.z));
	return normal;
}