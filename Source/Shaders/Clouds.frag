#include "HeightMap.frag"

uniform bool iEnableClouds;
uniform float iCloudStrength;
// cloud box
uniform float iCloudBoxLowerY;
uniform float iCloudBoxUpperY;
// fbm
uniform float iCloudFbmStrength;
// raymarch
uniform int iCloudRaymarchSteps;


float cloud_density(vec3 _p) {
	float half_height = (iCloudBoxUpperY - iCloudBoxLowerY) * 0.5;
	float center_y = iCloudBoxLowerY + half_height;
	float d = abs(_p.y - center_y) - half_height;
	d = iCloudFbmStrength * terrain(_p);
	return -d;
}

vec3 raymarch_clouds(
	in vec3 _camera_pos,
	in vec3 _ray_dir
){
	// 0. skip if ray doesn't intersect bounding box
	if ((_camera_pos.y < iCloudBoxLowerY && _ray_dir.y < 0.0) ||
		(_camera_pos.y > iCloudBoxUpperY && _ray_dir.y > 0.0)){
		return vec3(0.0);
	}

	// 1. find start and end in bounding cloud box
	float total_dist = 2 * (iCloudBoxUpperY - iCloudBoxLowerY);
	vec3 start = _camera_pos;
	vec3 end = _camera_pos + _ray_dir * total_dist;

	if (abs(_ray_dir.y) > 0.01){
		float dist_to_lower = (iCloudBoxLowerY - _camera_pos.y) / _ray_dir.y;
		float dist_to_upper = (iCloudBoxUpperY - _camera_pos.y) / _ray_dir.y;

		float start_dist = max(min(dist_to_lower, dist_to_upper), 0.0);
		float end_dist = max(dist_to_lower, dist_to_upper);

		start = _camera_pos + _ray_dir * start_dist;
		end = _camera_pos + _ray_dir * end_dist;
		total_dist = end_dist - start_dist;
	}

	// 2. ray march
	float cum_density = 0.0;
	float step_size = total_dist / float(iCloudRaymarchSteps);
	for (float t = 0.0; t < total_dist; t += step_size){
		vec3 p = start + _ray_dir * t;
		float d = cloud_density(p);
		if (d > 0.0){
			cum_density += d * step_size;
		}
	}
	return vec3(cum_density) / (100 * total_dist);
	return exp(-0.0001 * distance(start.xz, _camera_pos.xz)) * 
		vec3(cum_density/100000);
}