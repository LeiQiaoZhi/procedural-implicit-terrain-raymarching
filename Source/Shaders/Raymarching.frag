#version 330 core

#include "HeightMap.frag"

out vec4 FragColor;

uniform float iTime;
uniform vec2 iResolution;

// noise layer parameters
const float heights[NUM_LAYER] = float[3](200, 20, 2);
const float scales[NUM_LAYER] = float[3](200.0, 100.0, 50.0);
const vec2 offsets[NUM_LAYER] = vec2[3](
    vec2(0.0,0.0), vec2(0.0,0.0), vec2(0.0,0.0)
);
// random different rotations using pythagorean theorem
const mat2 rotations[NUM_LAYER] = mat2[3](
	mat2(0.8, 0.6, -0.6, 0.8),
	mat2(0.8, 0.6, -0.6, 0.8) * mat2(0.8, 0.6, -0.6, 0.8),
	mat2(0.8, 0.6, -0.6, 0.8) * mat2(0.8, 0.6, -0.6, 0.8) * mat2(0.8, 0.6, -0.6, 0.8)
);

// camera parameters
uniform vec3 iCameraPos;
uniform vec3 iCameraFwd; 
uniform vec3 iCameraRight; 
uniform vec3 iCameraUp; 
const float focal_length = 1;

// raymarching parameters
const int MAX_STEPS = 500;
const float step = 2;

// light parameters
const vec3 sunPos = vec3(300.0, 400.0, -200.0);

void main() 
{
	vec2 NDC = (gl_FragCoord.xy / min(iResolution.x, iResolution.y)) * 2.0 - 1.0;
	vec3 screenCenter = iCameraPos + normalize(iCameraFwd) * focal_length;
	vec3 pixelWorld = screenCenter 
		+ NDC.x * normalize(iCameraRight) + NDC.y * normalize(iCameraUp);
	vec3 ray = normalize(pixelWorld - iCameraPos);

	// raymarching
	vec3 pos = iCameraPos;
	for (int i = 0; i < MAX_STEPS; i++) 
	{
		pos += ray * step;
		vec4 result = layerNoise(pos.x,pos.z,heights, scales, offsets, rotations, 0);
		float height = result.x;
		vec3 normal = normalize(vec3(result.y, result.z, result.w));
		if (pos.y < height) 
		{
			vec3 pointToSun = normalize(sunPos - pos);
			vec3 color = max(0,dot(normal, pointToSun)) * vec3(0.8, 0.4, 0.3);
			FragColor = vec4(color, 1.0);
			return;
		}
	}

	// light blue sky
    FragColor = vec4(0.5, 0.7, 1.0, 1.0);
}
