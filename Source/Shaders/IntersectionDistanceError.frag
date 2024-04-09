uniform bool iStartIDE = false;

in vec2 iIncrementalTexCoord;
uniform sampler2D iIncrementalTexture;
uniform int iIncrementalStepsLeft;

#include "Encoding.frag"


// returns the distance to the terrain 
float ground_truth_raymarch_terrain(
    in  vec3  _pos,
    in  vec3  _ray,
    in  float _max_distance,
    in  float _step_size,
    out bool  found_
){
    found_ = false;
    
	vec3 origin = _pos;
	float last_height;
	float last_y;
    vec3  last_pos = origin;

	float t = 0;
	float step_size = _step_size;
	for (int i = 0; i < 5000; i++)
	{
		_pos = origin + t * _ray;

		float height = terrain_fbm(_pos.xz);

		// check for terrain intersection
		if (_pos.y < height) 
		{
            found_ = true;

            if (_pos == last_pos) {
                return t;
            }

            vec3 below_pos = _pos;
            vec3 above_pos = last_pos;
            binary_search_refine(below_pos, above_pos);
            float extra_length = interpolate_intersection(below_pos, above_pos);
            t -= length(below_pos - _pos);
            t -= extra_length;
			return t;
		}

		last_height = height;
		last_y = _pos.y;
        last_pos = _pos;

		t += step_size;

		// early termination
		if (t > _max_distance) break;

	}
	return t;
}


bool render_intersection_distance_error(
    in    float _t, // distance to compare to
    in    vec3  _camera_pos,
    in    vec3  _ray,
    inout vec4  color_
){
    if (!iStartIDE) {
        return false;
    }

    vec4 base = texture(iIncrementalTexture, iIncrementalTexCoord);
    // interpret the base distance and state
    float base_t = vec4_to_float(base);
    // float base_t = float(rgb_to_uint(base.rgb));
    // float base_t = base.r * iMaxDistance;

    // bool base_found = base.a == 1.0;
    bool base_found = base_t > 0;
    base_t = abs(base_t);

    // output error in encoding
    if (iIncrementalStepsLeft == 0) {
        if (!base_found){
            // ignore ground truth no intersection regions
            color_ = float_to_vec4(-100); return true;
        }
        if (base_found && _t == -1){
            // missed intersection error
            color_ = float_to_vec4(-1); return true;
        }
        // distance error
        color_ = float_to_vec4(abs(base_t - _t));
        return true;
    }
    // output error visually
    else if (iIncrementalStepsLeft == 1) {
        if (base_found && _t == -1){
            // missed intersection error
            color_ = vec4(RED,1); return true;
        }
        // distance error
        color_ = vec4(vec3(abs(base_t - _t) / iProfileCustomMax), base_found);   
        return true;
    }
    // output final ground truth distance visually
    else if (iIncrementalStepsLeft == 2) {
        color_ = vec4(vec3(base_t / iMaxDistance), base_found);   
        return true;
    }
    // output practical distance visually
    else if (iIncrementalStepsLeft == 3) {
        color_ = vec4(vec3(_t / iMaxDistance), _t == -1 ? 0.0 : 1.0);   
        return true;
    }

    // already found, no need to do more raymarching
    if (base_found){
        color_ = float_to_vec4(base_t);
        // color_ = vec4(uint_to_rgb(uint(base_t)), 1.0);
        return true;
    }

    // incremental raymarch
    bool found;
    float incremental_t = ground_truth_raymarch_terrain(
        _camera_pos + base_t * _ray,
        _ray,
        iMaxDistance,
        1.0,
        found
    );

    float ground_truth_t = incremental_t + base_t;

    color_ = float_to_vec4(ground_truth_t * (found ? 1.0 : -1.0));
    // color_ = vec4(uint_to_rgb(uint(ground_truth_t)), found);
    // color_ = vec4(vec3(ground_truth_t / iMaxDistance), found? 1.0 : 0.0);
    
    return true;
}