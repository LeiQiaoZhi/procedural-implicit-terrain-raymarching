#include "Fbm.frag"

// overall
uniform bool iEnableClouds;
uniform float iCloudStrength;
uniform float iCloudBaseColor; 
// cloud box
uniform float iCloudBoxLowerY;
uniform float iCloudBoxUpperY;
// fbm
uniform float iCloudFbmStrength;
// TODO: its own fbm parameters
// raymarch
uniform int iCloudRaymarchSteps;
uniform float iCloudMinStepSize;
uniform float iCloudMaxRaymarchDist;
uniform float iCloudStepDistScale; // dynamic step size
uniform float iCloudStepDensityScale;
uniform float iCloudSampleAlpha; // front to back blending
uniform float iCloudMaxCumAlpha; 



float cloud_density(vec3 _p) {
	float half_height = (iCloudBoxUpperY - iCloudBoxLowerY) * 0.1;
	float center_y = (iCloudBoxLowerY + iCloudBoxUpperY) * 0.5;
	float d = abs(_p.y - center_y) - half_height;
	d += iCloudFbmStrength * terrain_3D_fbm_d(_p).x;
	return min(-d, 0.25);
}


vec3 inigo_raymarch_clouds(
	in vec3 _camera_pos,
	in vec3 _ray_dir,
	out float _cum_density
){
	// 0. skip if ray doesn't intersect bounding box
	if ((_camera_pos.y < iCloudBoxLowerY && _ray_dir.y < 0.0) ||
		(_camera_pos.y > iCloudBoxUpperY && _ray_dir.y > 0.0)){
		return vec3(0.0);
	}

	// 1. find start and end in bounding cloud box
	float start_dist = 0.0;
	float ray_dist = iCloudMaxRaymarchDist;
	float end_dist = ray_dist;
	vec3 start = _camera_pos;
	vec3 end = _camera_pos + _ray_dir * end_dist;

	if (abs(_ray_dir.y) > 0.001){
		float dist_to_lower = (iCloudBoxLowerY - _camera_pos.y) / _ray_dir.y;
		float dist_to_upper = (iCloudBoxUpperY - _camera_pos.y) / _ray_dir.y;

		start_dist = max(min(dist_to_lower, dist_to_upper), 0.0);
		end_dist = min(max(dist_to_lower, dist_to_upper), iCloudMaxRaymarchDist);

		start = _camera_pos + _ray_dir * start_dist;
		end = _camera_pos + _ray_dir * end_dist;
		ray_dist = end_dist - start_dist;
	}

	// 2. ray march
	vec4 cum_color = vec4(0.0);
	_cum_density = 0.0;
	float t = 0;
	for (int i = 0; i < iCloudRaymarchSteps; i++){
		vec3 p = start + _ray_dir * t;
		float dt = max(iCloudMinStepSize, iCloudStepDistScale * t); // dynamic step size

		float density = cloud_density(p);
		if (density > 0.001){
			_cum_density += density * dt;
			// TODO: front to back blending
			vec3 color = vec3(iCloudBaseColor);
			float alpha = clamp(0.1 * iCloudSampleAlpha * density * dt, 0.0, 1.0);
			color *= alpha;
			cum_color += vec4(color, alpha) * (iCloudMaxCumAlpha-cum_color.a);
		}else{
			dt = iCloudStepDensityScale * abs(density) + iCloudMinStepSize;
		}
		t += dt;
		if (t > ray_dist || cum_color.a > iCloudMaxCumAlpha){
			break;
		}
	}
	_cum_density /= t;
	return cum_color.rgb / (t);
}



void inigo_render_clouds_i(
	in int _obj,
	in vec3 _camera_pos,
	in vec3 _view_ray,
	inout vec3 _color
){
	if (_obj > 0 && (_camera_pos.y < iCloudBoxLowerY || _view_ray.y < 0))
		return;
	if (!iEnableClouds)
		return;

	float cloud_density;
	vec3 cloud_color = 
		iCloudStrength 
		* inigo_raymarch_clouds(_camera_pos, _view_ray, cloud_density);

	// blending with original color
	_color = 
		exp(-cloud_density) * _color 
		+ (1-exp(-cloud_density)) * cloud_color;
}
