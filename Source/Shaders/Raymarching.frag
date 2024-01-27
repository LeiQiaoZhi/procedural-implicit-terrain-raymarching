#include "Tree.frag"
#include "Debug.frag"

// raymarching parameters
uniform int iMaxDistance;
uniform int iMaxSteps;
uniform float iStepSize;
uniform float iStepSizeDistanceRatio;
uniform float iStepSizeAboveTreeRatio;

// camera parameters
uniform vec3 iCameraPos;
uniform vec3 iCameraFwd; 
uniform vec3 iCameraRight; 
uniform vec3 iCameraUp; 
uniform float iFocalLength;


float sphere_sdf(
	in vec3 _pos,
	in float _radius
){
	return length(_pos) - _radius;
}


float planet_sdf(
	in vec3 _pos,
	in float _radius
){
	vec3 pos = normalize(_pos) * _radius;
	vec3 normal = normalize(pos);
	vec2 xuv = pos.zy + sign(pos.x) * vec2(10000, 29000);
	vec2 yuv = pos.xz + sign(pos.y) * vec2(10000, 29000) * 2;
	vec2 zuv = pos.xy + sign(pos.z) * vec2(10000, 29000) * 3;
	float xheight = terrain_fbm_d(xuv).x;
	float yheight = terrain_fbm_d(yuv).x;
	float zheight = terrain_fbm_d(zuv).x;
	vec3 heights = vec3(xheight, yheight, zheight);
	heights = (heights / (iMaxHeight + iGlobalMaxHeight) + 1) * 0.5;
	vec3 weights = pow(abs(normal), vec3(iDebugTriplanarMappingSharpness));
	weights = weights / (weights.x + weights.y + weights.z);
	float height = dot(heights, weights) * (iMaxHeight + iGlobalMaxHeight);
	return length(_pos) - _radius - height;
}


float raymarch_sphere(
	in vec3 pos,
	in vec3	ray
){
	vec3 origin = pos;
	float clipNear = 0.1;
	float lastHeight;
	float lastY;

	float t = clipNear;
	float step_size = iStepSize;
	for (int i = 0; i < iMaxSteps; i++)
	{
		pos = origin + t * ray;

		float dist_to_outer = sphere_sdf(pos, iDebugSphereRadius + iMaxHeight + iGlobalMaxHeight);
		if (dist_to_outer < 0){
			float height = planet_sdf(pos, iDebugSphereRadius);

			// check for terrain intersection
			if (height < 0)
			{
				// interpolation
				t -= step_size * height / (height - lastHeight);
			
				return t;
			}

			lastHeight = height;
		}
		step_size = max(iStepSize, dist_to_outer);

		t += step_size;

		if (t > iMaxDistance) break;

	}
	return -1;
}


// TODO: Fix naming convention
// returns the distance to the terrain 
float raymarchTerrain(
	in vec3 pos,
	in vec3	ray,
	in float _max_distance,
	in float _start_step_size,
	out float tTree // distance to intersection with tree
){
	// TODO: use max terrain height and max tree height to determine max distance

	tTree = -1; // no tree hit

	vec3 origin = pos;
	float clipNear = 0.1;
	float lastHeight;
	float lastY;
	float treeMaxHeight = 1.0 * iTreeHeight + iTreeOffset + 0.5 * iTreeSizeRandomness.y; 

	float t = clipNear;
	float step_size = _start_step_size;
	for (int i = 0; i < iMaxSteps; i++)
	{
		pos = origin + t * ray;

		float height = terrain_fbm(pos.xz);
		float treeHeight = height + treeMaxHeight;

		// check for tree intersection
		if (tTree < 0 && pos.y < treeHeight)
		{
			// interpolation
			tTree = t - step_size * 
				(treeHeight - pos.y) /
				(lastY - lastHeight - treeMaxHeight + treeHeight - pos.y); 	
			// tTree = t - 1 * step_size;
		}

		// check for terrain intersection
		if (pos.y < height) 
		{
			// interpolation
			t -= step_size * 
				(height - pos.y) / (lastY - lastHeight + height - pos.y);

			return t;
		}

		lastHeight = height;
		lastY = pos.y;

		step_size = _start_step_size + t * iStepSizeDistanceRatio * 0.1
			+ (max(pos.y - treeHeight,0)) * 0.01 * iStepSizeAboveTreeRatio;
		t += step_size;

		// early termination
		if (pos.y > iMaxHeight + treeMaxHeight && lastY < pos.y) break;
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
