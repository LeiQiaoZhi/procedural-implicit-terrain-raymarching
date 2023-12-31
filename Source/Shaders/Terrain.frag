#include "Fbm.frag"

// fbm
uniform float iHorizontalScale;
uniform float iMaxHeight;
uniform int iNumLayers;
uniform vec2 iFilterRange;
uniform float iHorizontalShrink;
uniform float iVerticalShrink;
uniform float iVerticalShrinkStart;
// shadow
uniform int iTerrainShadowSteps;


vec4 terrain_3D_fbm_d(in vec3 pos){
	vec4 result = fbm_3D_d(
		pos / iHorizontalScale, 
		iNumLayers,
		iHorizontalShrink,
		iVerticalShrinkStart,
		iVerticalShrink,
		iFilterRange
	);
	result *= iMaxHeight;
	float height = result.x;
	result.yzw /= iHorizontalScale;
	return vec4(height, normalize(result.yzw));
}


// return (height, normal)
vec4 terrain_fbm_d(in vec2 pos){
	vec3 result = fbm_d(
		pos / iHorizontalScale, 
		iNumLayers,
		iHorizontalShrink,
		iVerticalShrinkStart,
		iVerticalShrink,
		iFilterRange
	);
	result *= iMaxHeight;
	float height = result.x;
	result.yz /= iHorizontalScale;
	vec3 normal = normalize(vec3(-result.y, 1.0, -result.z));
	return vec4(height, normal);
}


float terrainShadow(in vec3 pos, in vec3 pointToSun){
	// shadow ray
	float shadowStepSize = 1;
	float minR = 1;
	for (float t = 1; t < iTerrainShadowSteps * shadowStepSize; t += shadowStepSize) 
	{
		vec3 shadowPos = pos + t * pointToSun;
		float d = shadowPos.y - terrain_fbm_d(shadowPos.xz).x;
		minR = min(minR, 2 * d / t);

		if (minR < 0.001){
			break;
		}
	}

	float shadow = smoothstep(0.0, 1.0, minR);
	return shadow;
}


