#include "ValueNoise.frag"

uniform float iHorizontalScale;
uniform float iMaxHeight;
uniform int iNumLayers;
uniform vec2 iFilterRange;

const mat2 rot = mat2(  0.80,  0.60,
                      -0.60,  0.80 );
const mat2 roti = mat2( 0.80, -0.60,
                       0.60,  0.80 );

vec3 fbmd(in vec2 pos, in int num_layers,
    float shrink_h = 1.9, // shrink factor horizontally (x,z)
    float shrink_v_start = 0.5, // starting value for vertical (y) noise
    float shrink_v = 0.5 // shrink factor vertically (y) (height)
)
{
    float v = shrink_v_start;
    float height = 0.0; // cumulative height
    vec2 dxz = vec2(0.0); // (dx, dz), cumulative slopes
    mat2 chain = mat2(1.0, 0.0, // matrix for chain rule
                   0.0, 1.0);

    for(int i = 0; i < num_layers; i++)
    {
        if (i >= iFilterRange.x && i <= iFilterRange.y) {
            continue;
		}   
        vec3 noise = v * noised(pos);
        height += noise.x;
        dxz += chain * noise.yz;
        v *= shrink_v;
        pos = shrink_h * rot * pos;
        chain = shrink_h * roti * chain;
    }

	return vec3(height, dxz);
}

// return (height, normal)
vec4 terraind(in vec2 pos){
	vec3 result = fbmd(
        pos / iHorizontalScale, 
        iNumLayers
    );
	result *= iMaxHeight;
	float height = result.x + 600;
	result.yz /= iHorizontalScale;
	vec3 normal = normalize(vec3(-result.y, 1.0, -result.z));
    return vec4(height, normal);
}
