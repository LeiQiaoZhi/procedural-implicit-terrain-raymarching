#version 330 core

#include "ValueNoise.frag"

out vec4 FragColor;

uniform float iTime;
uniform vec2 iResolution;

void main() 
{
    const int numLayers = 3;

    const float heights[3] = float[3](0.8, 0.25, 0.125);
    const float scales[3] = float[3](200.0, 50.0, 20.0);
    const vec2 offsets[3] = vec2[3](
        vec2(0.0,0.0), vec2(0.0,0.0), vec2(0.0,0.0)
    );
    // random different rotations using pythagorean theorem
    const mat2 rotations[3] = mat2[3](
		mat2(0.8, 0.6, -0.6, 0.8),
		mat2(0.6, 0.8, -0.8, 0.6),
		mat2(0.8, 0.6, -0.6, 0.8)
	);

    float x = gl_FragCoord.x;
    float y = gl_FragCoord.y;

    // layering of noise
    float layeredNoise = 0;

    for(int i = 0; i < numLayers; i++)
	{
        vec2 movement = iTime * vec2(100);
        vec2 pos = rotations[i] * (vec2(x,y)+movement) / scales[i] + offsets[i];
		layeredNoise += heights[i] * 
            noise(
                pos.x,
                pos.y
            );
	}

    FragColor = vec4(layeredNoise);
}
