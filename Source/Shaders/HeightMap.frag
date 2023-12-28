#include "ValueNoise.frag"
#include "Debug.frag"

uniform float iHorizontalScale;
uniform float iMaxHeight;
uniform int iNumLayers;
uniform vec2 iFilterRange;
uniform float iHorizontalShrink;
uniform float iVerticalShrink;
uniform float iVerticalShrinkStart;

const mat2 rot = mat2(  0.80,  0.60,
					  -0.60,  0.80 );
const mat2 roti = mat2( 0.80, -0.60,
					   0.60,  0.80 );
const mat3 rot3  = mat3( 0.00,  0.80,  0.60,
                      -0.80,  0.36, -0.48,
                      -0.60, -0.48,  0.64 );
const mat3 rot3i = mat3( 0.00, -0.80, -0.60,
                       0.80,  0.36, -0.48,
                       0.60, -0.48,  0.64 );

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


// use 3d noise
float fbm(
	in vec3 pos, 
	in int num_layers,
	in float shrink_h = 1.9, // shrink factor horizontally (x,z)
	in float shrink_v_start = 0.5, // starting value for vertical (y) noise
	in float shrink_v = 0.5 // shrink factor vertically (y) (height)
)
{
	float v = shrink_v_start;
	float height = 0.0; // cumulative height
	mat3 chain = mat3(1.0,0.0,0.0,
                   0.0,1.0,0.0,
                   0.0,0.0,1.0); // cumulative matrix for chain rule
	for(int i = 0; i < num_layers; i++)
	{
		float noise = v * noise3D(pos);
		if (i < iFilterRange.x || i >= iFilterRange.y) {
			height += noise;
		}   
		v *= shrink_v;
		pos = shrink_h * rot3 * pos;
		chain = shrink_h * rot3i * chain;
	}

	return height;
}

float terrain(in vec3 pos){
	float result = fbm(
		pos / iHorizontalScale, 
		iNumLayers,
		iHorizontalShrink,
		iVerticalShrinkStart,
		iVerticalShrink
	);
	result *= iMaxHeight;
	float height = result;
	return height;
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
	float height = result.x;
	result.yz /= iHorizontalScale;
	vec3 normal = normalize(vec3(-result.y, 1.0, -result.z));
	return vec4(height, normal);
}
