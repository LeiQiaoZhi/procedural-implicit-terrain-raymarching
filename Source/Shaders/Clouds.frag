#include "Fbm.frag"

// overall
uniform bool  iEnableClouds;
uniform float iCloudStrength;
uniform float iCloudBaseColor; 
uniform float iCloudDensity; 
// cloud box
uniform float iCloudBoxLowerY;
uniform float iCloudBoxUpperY;
// raymarch
uniform int   iCloudRaymarchSteps;
uniform float iCloudMinStepSize;
uniform float iCloudMaxRaymarchDist;
uniform float iCloudStepDistScale; // dynamic step size
uniform float iCloudStepDensityScale;
uniform float iCloudSampleAlpha; // front to back blending
uniform float iCloudMaxCumAlpha = 1.0; 
// fbm
uniform float iCloudHorizontalScale;
uniform float iCloudMaxHeight;
uniform int   iCloudNumLayers;
uniform float iCloudHorizontalShrink;
uniform float iCloudVerticalShrink;
uniform vec2  iCloudFilterRange;
uniform vec2  iCloudNormalFilterRange;
// lighting
uniform float iCloudAmbient;
uniform float iCloudDiffuse;
uniform int iCloudShadowSteps;
uniform float iCloudShadowStepSize;

uniform float iCloudObjBlendStrength;


vec4 cloud_fbm_d(
	in vec3 pos
){
	float height = fbm_3D_d(
		pos / iCloudHorizontalScale, 
		iCloudNumLayers,
		iCloudHorizontalShrink,
		0.5,
		iCloudVerticalShrink,
		iCloudFilterRange
	).x;
	// TODO: optimisation
	vec3 gradient = fbm_3D_d(
		pos / iCloudHorizontalScale, 
		iCloudNumLayers,
		iCloudHorizontalShrink,
		0.5,
		iCloudVerticalShrink,
		iCloudNormalFilterRange
	).yzw;
	height *= iCloudMaxHeight;
	gradient *= iCloudMaxHeight / iCloudHorizontalScale;
	return vec4(height, normalize(gradient));
}


// returns (density, normal)
vec4 cloud_density_d(
	in vec3 _p
){
	float half_height = (iCloudBoxUpperY - iCloudBoxLowerY) * 0.1;
	float center_y = (iCloudBoxLowerY + iCloudBoxUpperY) * 0.5;
	float d = abs(_p.y - center_y) - half_height;
	vec4 fbm_d = cloud_fbm_d(_p);
	d += fbm_d.x;

	// vec3 gradient = fbm_d.yzw;
	// this approximation is better somehow
	vec3 gradient = vec3(0, sign(_p.y - center_y), 0);

	d = min(-d + iCloudDensity, 0.25);
	return vec4(d, gradient);
}


vec4 inigo_raymarch_clouds(
	in  vec3  _camera_pos,
	in  vec3  _ray_dir,
	in  vec3  _sun_pos,
	out float _cum_density
){
	// 0. skip if ray doesn't intersect bounding box
	if ((_camera_pos.y < iCloudBoxLowerY && _ray_dir.y < 0.0) ||
		(_camera_pos.y > iCloudBoxUpperY && _ray_dir.y > 0.0)){
		return vec4(0.0);
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

		vec4 density_d = cloud_density_d(p);
		float density = density_d.x;
		if (density > 0.001){
			_cum_density += density * dt;
			vec3 color = vec3(iCloudBaseColor);

			// lighting
			vec3 normal = density_d.yzw;
			vec3 sun_ray = normalize(_sun_pos - p);
			// TODO: shadow
			float shadow = 0.0; // 1.0 if in full shadow (black)
			for (int j = 1; j <= iCloudShadowSteps; j++){
				float shadow_t = float(j) * iCloudShadowStepSize;
				vec3 shadow_p = p + sun_ray * shadow_t;
				vec4 shadow_density_d = cloud_density_d(shadow_p);
				if (shadow_density_d.x > 0.001){
					shadow = 1.0;
				}
			}

			// ambient and diffuse
			color *= iCloudAmbient + iCloudDiffuse * dot(normal, sun_ray);
			color = mix(color, vec3(1.0, 0, 0), shadow);

			// front to back blending
			float alpha = clamp(0.001 * iCloudSampleAlpha * density * dt, 0.0, iCloudMaxCumAlpha);
			color *= alpha;
			cum_color += vec4(color, alpha) * (iCloudMaxCumAlpha-cum_color.a);
		}
		else {
			dt = iCloudStepDensityScale * abs(density) + iCloudMinStepSize;
		}
		t += dt;
		if (t > ray_dist || cum_color.a > 0.995 * iCloudMaxCumAlpha){
			break;
		}
	}
	_cum_density /= t;
	return clamp(cum_color, 0.0, 1.0);
}



void inigo_render_clouds_i(
	in int _obj,
	in vec3 _camera_pos,
	in vec3 _view_ray,
	in vec3 _sun_pos,
	inout vec3 _color
){
	// skip if 1. below clouds and looking down 
	// 2. below clouds and has intersection with objs
	// 3. above clouds and looking up
	if ((_camera_pos.y < iCloudBoxLowerY && (_view_ray.y < 0.0 || _obj > 0)) ||
		(_camera_pos.y > iCloudBoxUpperY && _view_ray.y > 0.0))
		return;
	if (!iEnableClouds)
		return;

	float cloud_density;
	vec4 cloud_color = 
		inigo_raymarch_clouds(_camera_pos, _view_ray, _sun_pos, cloud_density);

	//_color = cloud_color; return;
	// blending with original color
	if (cloud_density < 0.001)
		return;
	
	// float cloud_factor = 1 - exp(-cloud_density * iCloudObjBlendStrength);
	// cloud_factor = clamp(iCloudObjBlendStrength, 0.0, 1.0);
	// _color = mix(_color, cloud_color, cloud_factor);
	_color = (iCloudMaxCumAlpha - cloud_color.w)/iCloudMaxCumAlpha * _color 
		+ cloud_color.xyz * iCloudStrength;
}
