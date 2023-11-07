#version 330 core

#include "HeightMap.frag"

out vec4 FragColor;

// global parameters
uniform float iTime;
uniform vec2 iResolution;

// camera parameters
uniform vec3 iCameraPos;
uniform vec3 iCameraFwd; 
uniform vec3 iCameraRight; 
uniform vec3 iCameraUp; 
uniform float iFocalLength;

// raymarching parameters
uniform int iMaxSteps;
uniform float iStepSize;

uniform int iShadowSteps;
uniform float iFogStrength;

// tree parameters
uniform int iTreeSteps;
uniform vec3 iTreeColor;

// light parameters
uniform vec3 iSunPos = vec3(200, 2000.0, 3000.0);

// material parameters
uniform vec3 iGrassColor = vec3(0.2, 0.4, 0.1);
uniform float iGrassThreshold;
uniform vec3 iDirtColor = vec3(0.8, 0.4, 0.3);
uniform float iDirtThreshold;

// returns the distance to the terrain 
float raymarchTerrain(
	in vec3 pos,
	in vec3	ray,
	in int maxSteps,
	in float stepSize,
	out float tTree // distance to intersection with tree
){
	// TODO: use max terrain height and max tree height to determine max distance

	tTree = -1; // no tree hit

	vec3 origin = pos;
	float clip = 0.0;
	float lastHeight;
	float lastY;
	float treeMaxHeight = 1.0 * iTreeHeight + iTreeOffset + 0.5 * iTreeSizeRandomness.y; 

	for (float t = clip; t < maxSteps * stepSize; t += stepSize) 
	{
		pos = origin + t * ray;

		float height = terraind(pos.xz).x;
		float treeHeight = height + treeMaxHeight;

		// check for tree intersection
		if (tTree < 0 && pos.y < treeHeight)
		{
			// interpolation
			tTree = t - stepSize * 
				(treeHeight - pos.y) /
				(lastY - lastHeight - treeMaxHeight + treeHeight - pos.y); 	
			// tTree = t - 1 * stepSize;
		}

		// check for terrain intersection
		if (pos.y < height) 
		{
			// interpolation
			t -= stepSize * 
				(height - pos.y) / (lastY - lastHeight + height - pos.y);

			return t;
		}

		lastHeight = height;
		lastY = pos.y;
	}
	return -1;
}

float terrainShadow(in vec3 pos, in vec3 pointToSun){
	// shadow ray
	float shadowStepSize = 1;
	float minR = 1;
	for (float t = 1; t < iShadowSteps * shadowStepSize; t += shadowStepSize) 
	{
		vec3 shadowPos = pos + t * pointToSun;
		float d = shadowPos.y - terraind(shadowPos.xz).x;
		minR = min(minR, 2 * d / t);

		if (minR < 0.001){
			break;
		}
	}

	float shadow = smoothstep(0.0, 1.0, minR);
	return shadow;
}


float treeShadow(in vec3 pos, in vec3 pointToSun){
	// shadow ray
	float minR = 1;
	float t = 5;
	for (float i = 0; i < iShadowSteps; i++) 
	{
		vec3 shadowPos = pos + t * pointToSun;
		float d = treeSDF(shadowPos);
		minR = min(minR, 5 * d / t);
		t += 5;

		if (minR < 0.001 || t > 200){
			break;
		}
	}

	float shadow = smoothstep(0.0, 1.0, minR);
	return shadow;
}

void main() 
{
	vec2 NDC = (gl_FragCoord.xy / min(iResolution.x, iResolution.y)) * 2.0 - 1.0;
	vec3 screenCenter = iCameraPos + normalize(iCameraFwd) * iFocalLength;
	vec3 pixelWorld = screenCenter 
		+ NDC.x * normalize(iCameraRight) + NDC.y * normalize(iCameraUp);
	vec3 ray = normalize(pixelWorld - iCameraPos);

	// raymarching
	float distanceToTree;
	float distanceToTerrain = raymarchTerrain(iCameraPos, ray, iMaxSteps, iStepSize, distanceToTree);

	int obj = 0; // 0: sky, 1: terrain, 2: trees 
	float distanceToObj = -1;
	if (distanceToTerrain > 0){
		obj = 1;
		distanceToObj = distanceToTerrain;
	}
	if (distanceToTree > 0){
		// detailed raymarching of trees SDF
		for (int i = 0; i < iTreeSteps; i++){
			vec3 pos = iCameraPos + distanceToTree * ray;
			float d = treeSDF(pos);
			// occulusion by terrain
			if (distanceToTree > distanceToTerrain && distanceToTerrain > 0){
				break;
			}
			// hit
			if (d < 0.001 * distanceToTree){
				obj = 2;
				distanceToObj = distanceToTree;
				break;
			}
			distanceToTree += min(d,iDomainSize);
		}
	}

	if (obj > 0)
	{
		vec3 pos = iCameraPos + distanceToObj * ray;
		vec4 heightd = terraind(pos.xz);
		pos.y = heightd.x;
		vec3 pointToSun = normalize(iSunPos - pos);

		// normal
		vec3 normal = normalize(heightd.yzw);
		if (obj == 2){
			normal = normalize(treeNormal(pos));
		}

		// material
		float grassFactor =  smoothstepd(normal.y, iGrassThreshold, iDirtThreshold).x;
		vec3 matColor = grassFactor * iGrassColor
			+ (1 - grassFactor) * iDirtColor;

		if (obj == 2){
			matColor = iTreeColor;
		}

		// diffuse lighting
		vec3 color = max(0,dot(normal, pointToSun)) * matColor;
			
		// shadow 
		float terrainShadow = terrainShadow(pos, pointToSun);
		float treeShadow = treeShadow(pos + vec3(0, 5, 0), pointToSun);
		color = treeShadow  * color;

		// fog
		float distanceDecay = exp(-0.0002 * iFogStrength * distanceToObj);
		color = distanceDecay * color + (1-distanceDecay) * vec3(0.5);

		FragColor = vec4(color, 1.0);
		return;
	}	

	// sun
	vec3 camToSun = normalize(iSunPos - iCameraPos);
	if (dot(camToSun, ray) > 0.995) 
	{
		FragColor = vec4(0.8, 0.4, 0.1, 1.0);
		return;
	}

	// light blue sky
    FragColor = vec4(0.5, 0.7, 1.0, 1.0);
}
