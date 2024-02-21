// raymarching parameters
uniform bool  iRaymarchStartFromCamera;
uniform int   iMaxDistance;
uniform int   iMaxSteps;
uniform float iStepSize;
uniform float iMinStepSize;
uniform float iMaxStepSize;
// dynamic step size
uniform float iStepSizeAboveTreeRatio;
uniform int   iStepSizeFunctionSwitch;
uniform float iStepSizeDistanceRatio;
uniform float iStepSizeDistanceLogRatio;
uniform float iStepSizeDistanceExpRatio;
#define LINEAR 0
#define LOG 1
#define EXP 2

// camera parameters
uniform vec3  iCameraPos;
uniform vec3  iCameraFwd;
uniform vec3  iCameraRight;
uniform vec3  iCameraUp;
uniform float iFocalLength;

#include "Tree.frag"
#include "Debug.frag"
#include "ProfilingHeader.frag"


float sphere_sdf(
    in vec3  _pos,
    in float _radius
){
	return length(_pos) - _radius;
}


float raymarch_stepsize_function(
    in float _start_size,
    in float _distance,
    in vec3 _pos,
    in float _tree_height
){
    float step_size = _start_size;
    // scale with distance -- LOD
    switch(iStepSizeFunctionSwitch){
        case LINEAR:
            step_size += _distance * iStepSizeDistanceRatio * 0.1;
            break;
        case LOG:
            step_size += log(_distance + 1.0) * iStepSizeDistanceLogRatio * 0.1;
            break;
        case EXP:
            step_size += pow(2, _distance * iStepSizeDistanceExpRatio * 0.1) * 0.1;
            break;
    }
    // scale with height above trees
    step_size += (max(_pos.y - _tree_height,0)) * 0.01 * iStepSizeAboveTreeRatio;
    return clamp(step_size, iMinStepSize, iMaxStepSize);
}


// returns the distance to the terrain 
float raymarch_terrain(
    in  vec3  _pos,
    in  vec3  _ray,
    in  float _max_distance,
    in  float _start_step_size,
	out float distance_to_tree_ // distance to intersection with tree
){
	// TODO: use max terrain height and max tree height to determine max distance

	distance_to_tree_ = -1; // no tree hit
    float tree_freeze_distance = -1; // must > it to check for tree
    bool tree_confirmed = false;

	vec3 origin = _pos;
	float clip_near = 0.1;
	float last_height;
	float last_y;
	float tree_max_height = 1.0 * iTreeHeight + iTreeOffset + 0.5 * iTreeSizeRandomness.y; 

	float t = clip_near;
	float step_size = _start_step_size;
	for (int i = 0; i < iMaxSteps; i++)
	{
        PROFILE_TERRAIN_RAYMARCH_STEPS();

		_pos = origin + t * _ray;

		float height = terrain_fbm(_pos.xz);
		float tree_height = height + tree_max_height;


		// check for terrain intersection
		if (_pos.y < height) 
		{
			// interpolation
			t -= step_size * 
				(height - _pos.y) / (last_y - last_height + height - _pos.y);

			return t;
		}

		// check for tree intersection
		if (!tree_confirmed && _pos.y < tree_height
            && t > tree_freeze_distance
        )
		{
			// interpolation
			distance_to_tree_ = t - step_size * 
				(tree_height - _pos.y) /
				(last_y - last_height - tree_max_height + tree_height - _pos.y); 	

            // TODO: early test for tree intersection
            tree_confirmed = true;
            for (int j = 0; j < iTreeEarlyTestSteps; j++){
                PROFILE_TREE_RAYMARCH_STEPS();
                vec3 pos = origin + distance_to_tree_ * _ray;
                // if (pos.y > tree_height) break;
                float d = tree_sdf(pos);
                if (d < 0.001 * distance_to_tree_){
                    tree_confirmed = true;
                    break;
                }else{
                    tree_confirmed = false;
                }
                distance_to_tree_ += 1;
            }
            if (!tree_confirmed) {
                tree_freeze_distance = distance_to_tree_;
            }
		}


		last_height = height;
		last_y = _pos.y;

		t += raymarch_stepsize_function(_start_step_size, t / iFocalLength, _pos, tree_height);

		// early termination
		if (_pos.y > iMaxHeight + tree_max_height + iGlobalMaxHeight && last_y < _pos.y) break;
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
        PROFILE_TREE_RAYMARCH_STEPS();
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



vec3 get_pixel_world(
	in vec2 _ndc 
){
	vec3 screen_center = iCameraPos + normalize(iCameraFwd) * iFocalLength;
	vec3 pixel_world = screen_center 
		+ _ndc.x * normalize(iCameraRight) + _ndc.y * normalize(iCameraUp);
	return pixel_world;
}
