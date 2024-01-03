#include "ValueNoise.frag"

const mat2 ROT = mat2(  0.80,  0.60,
					  -0.60,  0.80 );
const mat2 ROT_I = mat2( 0.80, -0.60,
					   0.60,  0.80 );
const mat3 ROT_3  = mat3( 0.00,  0.80,  0.60,
                      -0.80,  0.36, -0.48,
                      -0.60, -0.48,  0.64 );
const mat3 ROT_3I = mat3( 0.00, -0.80, -0.60,
                       0.80,  0.36, -0.48,
                       0.60, -0.48,  0.64 );

vec3 fbm_d(
	in vec2 _pos, 
	in int _num_layers,
	float _shrink_h = 1.9, // shrink factor horizontally (x,z)
	float _shrink_v_start = 0.5, // starting value for vertical (y) noise
	float _shrink_v = 0.5, // shrink factor vertically (y) (height)
	in vec2 _filter_range = vec2(0,1) // filter range [0,1) -- no filtering
)
{
	float v = _shrink_v_start;
	float height = 0.0; // cumulative height
	vec2 dxz = vec2(0.0); // (dx, dz), cumulative slopes
	mat2 chain = mat2(1.0, 0.0, // matrix for chain rule
				   0.0, 1.0);

	for(int i = 0; i < _num_layers; i++)
	{
		vec3 noise = v * noise_d(_pos);
		if (i < _filter_range.x || i >= _filter_range.y) {
			height += noise.x;
			dxz += chain * noise.yz;
		}   
		v *= _shrink_v;
		_pos = _shrink_h * ROT * _pos;
		chain = _shrink_h * ROT_I * chain;
	}

	return vec3(height, dxz);
}


// TODO: calculate derivatives
// use 3d noise
float fbm(
	in vec3 _pos, 
	in int _num_layers,
	in float _shrink_h = 1.9, // shrink factor horizontally (x,z)
	in float _shrink_v_start = 0.5, // starting value for vertical (y) noise
	in float _shrink_v = 0.5, // shrink factor vertically (y) (height)
	in vec2 _filter_range = vec2(0,1) // filter range [0,1) -- no filtering
)
{
	float v = _shrink_v_start;
	float height = 0.0; // cumulative height
	mat3 chain = mat3(1.0,0.0,0.0,
                   0.0,1.0,0.0,
                   0.0,0.0,1.0); // cumulative matrix for chain rule
	for(int i = 0; i < _num_layers; i++)
	{
		float noise = v * noise_3D(_pos);
		if (i < _filter_range.x || i >= _filter_range.y) {
			height += noise;
		}   
		v *= _shrink_v;
		_pos = _shrink_h * ROT_3 * _pos;
		chain = _shrink_h * ROT_3I * chain;
	}

	return height;
}