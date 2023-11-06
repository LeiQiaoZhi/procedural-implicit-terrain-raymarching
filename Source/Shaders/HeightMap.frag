#include "ValueNoise.frag"

uniform float iHorizontalScale;
uniform float iMaxHeight;
uniform int iNumLayers;
uniform vec2 iFilterRange;
uniform float iHorizontalShrink;
uniform float iVerticalShrink;
uniform float iVerticalShrinkStart;

// tree SDF
uniform float iDomainSize;
uniform float iTreeRadius;
uniform float iTreeHeight;
uniform float iTreeOffset;
uniform float iTreeRandomness;

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
        vec3 noise = v * noised(pos);
        if (i < iFilterRange.x || i >= iFilterRange.y) {
            height += noise.x;
            dxz += chain * noise.yz;
		}   
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
        iNumLayers,
        iHorizontalShrink,
        iVerticalShrinkStart,
        iVerticalShrink
    );
	result *= iMaxHeight;
	float height = result.x + 600;
	result.yz /= iHorizontalScale;
	vec3 normal = normalize(vec3(-result.y, 1.0, -result.z));
    return vec4(height, normal);
}

// with domain repetition
float treeSDF(in vec3 pos){
	vec3 m = floor(pos / iDomainSize); // coord of domain
    float d = 1e10;

    // which neighbouring domains to check
    vec2 signs = sign(pos.xz - (m.xz + 0.5) * iDomainSize);

    // check neighbouring domains
    for (int i = 0; i <= 1; i++){
		for(int j = 0; j <= 1; j++){
	        vec3 center = (m + 0.5) * iDomainSize; // center of domain in world space
            center.xz += signs * vec2(i,j) * iDomainSize;
            vec2 randomOffset =  hash2(m.xz + signs * vec2(i,j)) - 0.5; // range [-0.5, 0.5]
            center += iTreeRandomness * vec3(randomOffset.x, 0.0, randomOffset.y) * iDomainSize;
            center.y = terraind(center.xz).x;

            vec3 r = vec3(iTreeRadius, iTreeHeight, iTreeRadius);
            // local position
            vec3 w = pos - center - vec3(0.0, iTreeOffset, 0.0);

            float wr = length(w/r);
            d = min(d, wr * (wr - 1.0) / length(w / (r * r)));
        }
	}

    return d;
}
