#include "ValueNoise.frag"

#define NUM_LAYER 3

const mat2 m2 = mat2(  0.80,  0.60,
                      -0.60,  0.80 );
const mat2 m2i = mat2( 0.80, -0.60,
                       0.60,  0.80 );

vec3 fbmd(in vec2 pos, in int num_layers)
{
    float shrink_h = 1.9; // shrink factor horizontally (x,z)
    float height = 0.0; // cumulative height
    float shrink_v = 0.5; // shrink factor vertically (y) (height)
    vec2  dxz = vec2(0.0); // (dx, dz), cumulative slopes
    mat2  m = mat2(1.0, 0.0, // matrix for chain rule
                   0.0, 1.0);

    for(int i = 0; i < num_layers; i++)
    {
        vec3 noise = noised(pos);
        height += shrink_v * noise.x;
        dxz += shrink_v * m * noise.yz;
        shrink_v *= 0.53;
        pos = shrink_h * m2 * pos;
        m = shrink_h * m2i * m;
    }

	return vec3(height, dxz);
}

// return (height, normal)
vec4 terraind(in vec2 pos){
    const float max_height = 1200;
    const float horizontal_scale = 4000.0;

	vec3 result = fbmd(pos / horizontal_scale, 9);
	result *= max_height;
	float height = result.x + 600;
	result.yz /= horizontal_scale;
	vec3 normal = normalize(vec3(-result.y, 1.0, -result.z));
    return vec4(height, normal);
}
