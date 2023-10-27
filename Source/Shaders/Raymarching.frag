#version 330 core

#include "HeightMap.frag"

out vec4 FragColor;

uniform float iTime;
uniform vec2 iResolution;

// noise layer parameters
const float heights[NUM_LAYER] = float[3](200, 10, 1);
const float scales[NUM_LAYER] = float[3](200.0, 50.0, 20.0);
const vec2 offsets[NUM_LAYER] = vec2[3](
    vec2(0.0,0.0), vec2(0.0,0.0), vec2(0.0,0.0)
);
// random different rotations using pythagorean theorem
const mat2 rotations[NUM_LAYER] = mat2[3](
	mat2(0.8, 0.6, -0.6, 0.8),
	mat2(0.6, 0.8, -0.8, 0.6),
	mat2(0.8, 0.6, -0.6, 0.8)
);

// camera parameters
const vec3 cameraPos = vec3(0.0, 100.0, 0.0);
const vec3 cameraFwd = vec3(0.0, -1.0, 5.0);
const vec3 cameraRight = vec3(1.0, 0.0, 0.0);
const vec3 cameraUp = vec3(0.0, 1.0, 1.0);
const float focal_length = 1;

// raymarching parameters
const int MAX_STEPS = 1000;
const float step = 1;

void main() 
{
	vec2 NDC = (gl_FragCoord.xy / min(iResolution.x, iResolution.y)) * 2.0 - 1.0;
	vec3 screenCenter = cameraPos + normalize(cameraFwd) * focal_length;
	vec3 pixelWorld = screenCenter 
		+ NDC.x * normalize(cameraRight) + NDC.y * normalize(cameraUp);
	vec3 ray = normalize(pixelWorld - cameraPos);

	vec3 pos = cameraPos;
	for (int i = 0; i < MAX_STEPS; i++) 
	{
		pos += ray * step;
		float height = layerNoise(pos.x,pos.z,heights, scales, offsets, rotations, 0);
		if (pos.y < height) 
		{
			FragColor = vec4(0.0, 0.0, 0.0, 1.0);
			return;
		}
	}

    FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
