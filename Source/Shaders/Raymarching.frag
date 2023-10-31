#version 330 core

#include "HeightMap.frag"

out vec4 FragColor;

uniform float iTime;
uniform vec2 iResolution;
uniform int iShadowSteps;

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
const int MAX_STEPS = 600;
const float ep = 5;

// light parameters
const vec3 sunPos = vec3(200, 2000.0, 3000.0);

void main() 
{
	// FragColor = vec4((1 + fbmd(gl_FragCoord.xy / 2000, 9).x) / 2, 0, 0, 1); return;

	vec2 NDC = (gl_FragCoord.xy / min(iResolution.x, iResolution.y)) * 2.0 - 1.0;
	vec3 screenCenter = iCameraPos + normalize(iCameraFwd) * focal_length;
	vec3 pixelWorld = screenCenter 
		+ NDC.x * normalize(iCameraRight) + NDC.y * normalize(iCameraUp);
	vec3 ray = normalize(pixelWorld - iCameraPos);

	// raymarching
	vec3 pos = iCameraPos;
	for (int i = 0; i < MAX_STEPS; i++) 
	{
		pos += ray * ep;

		vec4 heightd = terraind(pos.xz);
		float height = heightd.x;
		vec3 normal = heightd.yzw;

		if (pos.y < height) 
		{
			pos = vec3(pos.x, height, pos.z);
			vec3 pointToSun = normalize(sunPos - pos);
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
	}

	// sun
	vec3 camToSun = normalize(sunPos - iCameraPos);
	if (dot(camToSun, ray) > 0.995) 
	{
		FragColor = vec4(0.8, 0.4, 0.1, 1.0);
		return;
	}

	// light blue sky
    FragColor = vec4(0.5, 0.7, 1.0, 1.0);
}
