#include "Fbm.frag"
#include "ProfilingHeader.frag"
// fbm
uniform float iHorizontalScale;
uniform float iMaxHeight;
uniform int   iNumLayers;
uniform int   iNormalNumLayers;
uniform vec2  iFilterRange;
uniform float iHorizontalShrink;
uniform float iVerticalShrink;
uniform float iVerticalShrinkStart;
// shadow
uniform int   iTerrainShadowSteps;
uniform float iTerrainShadowStepSize;
// biome
uniform bool  iEnableBiome;
uniform int   iGlobalMaxHeight;
uniform float iBiomeHorizontalScale;
uniform float iBiomeMaxHeight;
uniform int   iBiomeNumLayers;
uniform float iBiomeHorizontalShrink;
uniform float iBiomeVerticalShrink;
// distortion
uniform bool  iEnableDistortion;
uniform float iDistortionHorizontalScale;
uniform float iDistortionMaxHeight;
uniform int   iDistortionNumLayers;
uniform float iDistortionHorizontalShrink;
uniform float iDistortionVerticalShrink;



vec2 domain_distortion(in vec2 _pos){
	if (!iEnableDistortion)
		return vec2(0.0);
	float result = fbm(
		_pos / iDistortionHorizontalScale, 
		iDistortionNumLayers,
		iDistortionHorizontalShrink,
		0.5,
		iDistortionVerticalShrink
	);
	return result * iDistortionMaxHeight * vec2(1.0, 1.0);
}



float biome(in vec2 pos){
	if (!iEnableBiome)
		return 1.0;

	float result = fbm(
		pos / iBiomeHorizontalScale, 
		iBiomeNumLayers,
		iBiomeHorizontalShrink,
		0.5,
		iBiomeVerticalShrink,
		vec2(1,1),
		false
	);
	return result * iBiomeMaxHeight;
}

vec4 biome_d(in vec2 pos){
	if (!iEnableBiome)
		return vec4(1.0, 0.0, 0.0, 0.0);

	vec3 result = fbm_d(
		pos / iBiomeHorizontalScale, 
		iBiomeNumLayers,
		iBiomeHorizontalShrink,
		0.5,
		iBiomeVerticalShrink,
		vec2(1,1), -1,
		false
	);
	result *= iBiomeMaxHeight;
	result.yz /= iBiomeHorizontalScale;
	vec3 normal = normalize(vec3(-result.y, 1.0, -result.z));
	return vec4(result.x, normal);
}


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


float terrain_fbm(in vec2 _pos){
	float result = fbm(
		_pos / iHorizontalScale + domain_distortion(_pos), 
		iNumLayers,
		iHorizontalShrink,
		iVerticalShrinkStart,
		iVerticalShrink,
		iFilterRange
	);
	float biome = biome(_pos);
	return biome * result * iMaxHeight + biome * iGlobalMaxHeight;
}


// return (height, normal)
vec4 terrain_fbm_d(in vec2 _pos){
	vec3 result = fbm_d(
		_pos / iHorizontalScale + domain_distortion(_pos), 
		iNumLayers,
		iHorizontalShrink,
		iVerticalShrinkStart,
		iVerticalShrink,
		iFilterRange,
		iNormalNumLayers
	);
	vec4 biome_d = biome_d(_pos);
	result *= iMaxHeight * biome_d.x;
	result.yz /= iHorizontalScale;
	result.yz -= biome_d.yw * iGlobalMaxHeight;
	vec3 normal = normalize(vec3(-result.y, 1.0, -result.z));
	return vec4(result.x + biome_d.x * iGlobalMaxHeight, normal);
}


float terrain_shadow(in vec3 pos, in vec3 pointToSun){
	// shadow ray
	float shadowStepSize = iTerrainShadowStepSize;
	float minR = 1;
	for (float t = 1; t < iTerrainShadowSteps * shadowStepSize; t += shadowStepSize) 
	{
        PROFILE_TERRAIN_SHADOW_STEPS();
		vec3 shadowPos = pos + t * pointToSun;
		float d = shadowPos.y - terrain_fbm(shadowPos.xz);
		minR = min(minR, 2 * d / t);

		if (minR < 0.001){
			break;
		}
	}

	float shadow = smoothstep(0.0, 1.0, minR);
	return shadow;
}


