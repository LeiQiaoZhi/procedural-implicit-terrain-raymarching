#include "Tree.frag"

// raymarching parameters
uniform int iMaxSteps;
uniform float iStepSize;

// camera parameters
uniform vec3 iCameraPos;
uniform vec3 iCameraFwd; 
uniform vec3 iCameraRight; 
uniform vec3 iCameraUp; 
uniform float iFocalLength;


// TODO: Fix naming convention
// returns the distance to the terrain 
float raymarchTerrain(
	in vec3 pos,
	in vec3	ray,
	in int maxSteps,
	in float stepSize,
	out float tTree // distance to intersection with tree
){
	// TODO: use max terrain height and max tree height to determine max distance

	tTree = -1; // no tree hit

	vec3 origin = pos;
	float clipNear = 0.1;
	float lastHeight;
	float lastY;
	float treeMaxHeight = 1.0 * iTreeHeight + iTreeOffset + 0.5 * iTreeSizeRandomness.y; 

	for (float t = clipNear; t < maxSteps * stepSize; t += stepSize) 
	{
		pos = origin + t * ray;

		float height = terrain_fbm(pos.xz);
		float treeHeight = height + treeMaxHeight;

		// check for tree intersection
		if (tTree < 0 && pos.y < treeHeight)
		{
			// interpolation
			tTree = t - stepSize * 
				(treeHeight - pos.y) /
				(lastY - lastHeight - treeMaxHeight + treeHeight - pos.y); 	
			// tTree = t - 1 * stepSize;
		}

		// check for terrain intersection
		if (pos.y < height) 
		{
			// interpolation
			t -= stepSize * 
				(height - pos.y) / (lastY - lastHeight + height - pos.y);

			return t;
		}

		lastHeight = height;
		lastY = pos.y;

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
