#include "ValueNoise.frag"

#define NUM_LAYER 3

float layerNoise(float x, float y, float heights[NUM_LAYER], float scales[NUM_LAYER], 
    vec2 offsets[NUM_LAYER], mat2 rotations[NUM_LAYER], float iTime) 
{
    // layering of noise
    float layeredNoise = 0;

    for(int i = 0; i < NUM_LAYER; i++)
	{
        vec2 movement = iTime * vec2(100);
        vec2 pos = rotations[i] * (vec2(x,y)+movement) / scales[i] + offsets[i];
		layeredNoise += heights[i] * 
            noise(
                pos.x,
                pos.y
            );
	}

    return layeredNoise;
}
