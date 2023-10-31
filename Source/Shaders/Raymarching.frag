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

// light parameters
const vec3 iSunPos = vec3(200, 2000.0, 3000.0);

vec3 raymarchTerrain(
	in vec3 pos,
	in vec3	ray,
	in int maxSteps,
	in float stepSize,
	out bool hit
){
	hit = false;

	vec3 origin = pos;
	float clip = 0.0;
	float lastHeight;
	float lastY;

	for (float t = clip; t < maxSteps * stepSize; t+=stepSize) 
	{
		pos = origin + t * ray;

		float height = terraind(pos.xz).x;
		if (pos.y < height) 
		{
			// interpolation
			pos -= ray * stepSize * 
				(height - pos.y) / (lastY - lastHeight + height - pos.y);
			pos.y = terraind(pos.xz).x;

			hit = true;
			break;
		}

		lastHeight = height;
		lastY = pos.y;
	}
	return pos;
}

void main() 
{
	vec2 NDC = (gl_FragCoord.xy / min(iResolution.x, iResolution.y)) * 2.0 - 1.0;
	vec3 screenCenter = iCameraPos + normalize(iCameraFwd) * iFocalLength;
	vec3 pixelWorld = screenCenter 
		+ NDC.x * normalize(iCameraRight) + NDC.y * normalize(iCameraUp);
	vec3 ray = normalize(pixelWorld - iCameraPos);

	// raymarching
	bool hit;
	vec3 pos = raymarchTerrain(iCameraPos, ray, iMaxSteps, iStepSize, hit);

	if (hit)
	{
		vec3 normal = normalize(terraind(pos.xz).yzw);
		vec3 pointToSun = normalize(iSunPos - pos);
		vec3 color = max(0,dot(normal, pointToSun)) * vec3(0.8, 0.4, 0.3);
			
		// shadow ray
		vec3 shadowPos = pos + vec3(0, 0.001, 0);
		for (int j = 0; j < iShadowSteps; j++) 
		{
			shadowPos += pointToSun * 0.01;
			if (shadowPos.y < terraind(shadowPos.xz).x) 
			{
				color = vec3(0.4,0,0);
				break;
			}
		}

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
