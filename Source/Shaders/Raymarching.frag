#include "Tree.frag"
#include "Debug.frag"

// raymarching parameters
uniform int   iMaxDistance;
uniform int   iMaxSteps;
uniform float iStepSize;
uniform float iStepSizeDistanceRatio;
uniform float iStepSizeAboveTreeRatio;

// camera parameters
uniform vec3  iCameraPos;
uniform vec3  iCameraFwd;
uniform vec3  iCameraRight;
uniform vec3  iCameraUp;
uniform float iFocalLength;


float sphere_sdf(
    in vec3  _pos,
    in float _radius
){
	return length(_pos) - _radius;
}


// TODO: Fix naming convention
// returns the distance to the terrain 
float raymarch_terrain(
	in vec3 _pos,
	in vec3	_ray,
	in float _max_distance,
	in float _start_step_size,
	out float distance_to_tree_ // distance to intersection with tree
){
	// TODO: use max terrain height and max tree height to determine max distance

	distance_to_tree_ = -1; // no tree hit

	vec3 origin = _pos;
	float clip_near = 0.1;
	float last_height;
	float last_y;
	float tree_max_height = 1.0 * iTreeHeight + iTreeOffset + 0.5 * iTreeSizeRandomness.y; 

	float t = clip_near;
	float step_size = _start_step_size;
	for (int i = 0; i < iMaxSteps; i++)
	{
		_pos = origin + t * _ray;

		float height = terrain_fbm(_pos.xz);
		float tree_height = height + tree_max_height;

		// check for tree intersection
		if (distance_to_tree_ < 0 && _pos.y < tree_height)
		{
			// interpolation
			distance_to_tree_ = t - step_size * 
				(tree_height - _pos.y) /
				(last_y - last_height - tree_max_height + tree_height - _pos.y); 	
			// distance_to_tree_ = t - 1 * step_size;
		}

		// check for terrain intersection
		if (_pos.y < height) 
		{
			// interpolation
			t -= step_size * 
				(height - _pos.y) / (last_y - last_height + height - _pos.y);

			return t;
		}

		last_height = height;
		last_y = _pos.y;

		step_size = _start_step_size + t * iStepSizeDistanceRatio * 0.1
			+ (max(_pos.y - tree_height,0)) * 0.01 * iStepSizeAboveTreeRatio;
		t += step_size;

		// early termination
		if (_pos.y > iMaxHeight + tree_max_height && last_y < _pos.y) break;
		if (t > _max_distance) break;

	}
	return -1;
}



float raymarch_trees(
	in vec3 _camera_pos,	
	in float _start_distance, 
	in float _distance_to_terrain,
	in vec3 _view_ray,
	out int tree_species_,
	out float tree_age_,
	out float rel_tree_height_
){
	float distance_to_tree = _start_distance;
	// detailed raymarching of trees SDF
	for (int i = 0; i < iTreeSteps; i++){
		vec3 pos = _camera_pos + distance_to_tree * _view_ray;
		float d = tree_sdf(pos, tree_species_, tree_age_, rel_tree_height_);
		// occulusion by terrain
		if (distance_to_tree > _distance_to_terrain && _distance_to_terrain > 0){
			break;
		}
		// hit
		if (d < 0.001 * distance_to_tree){
			return distance_to_tree;
		}
		distance_to_tree += min(d,iTreeDomainSize);
	}
	return -1;
}



vec3 get_view_ray(
	in vec2 _ndc 
){
	vec3 screen_center = iCameraPos + normalize(iCameraFwd) * iFocalLength;
	vec3 pixel_world = screen_center 
		+ _ndc.x * normalize(iCameraRight) + _ndc.y * normalize(iCameraUp);
	return normalize(pixel_world - iCameraPos);
}
