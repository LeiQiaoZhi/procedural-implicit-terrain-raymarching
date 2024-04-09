#include "Fbm.frag"
#include "Sun.frag"
#include "Motion.frag"
#include "ProfilingHeader.frag"

// overall
uniform bool  iEnableClouds;
uniform float iCloudStrength;
uniform float iCloudBaseColor; 
uniform float iCloudDensity; 
uniform float iCloudMaxDensity; 
// sun blend
uniform float iCloudSunBlendStrength;
uniform float iCloudSunBlendDensityFactor;
uniform int   iCloudSunBlendDotPower;
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
uniform vec2  iCloudOffsetDirection;
uniform float iCloudHorizontalScale;
uniform float iCloudMaxHeight;
uniform int   iCloudNumLayers;
uniform float iCloudHorizontalShrink;
uniform float iCloudVerticalShrink;
uniform vec2  iCloudFilterRange;
uniform int   iCloudNormalNumLayers;
// lighting
uniform float iCloudAmbient;
uniform float iCloudDiffuse;
uniform int   iCloudShadowSteps;
uniform float iCloudShadowStepSize;
uniform float iCloudShadowStrength;
uniform float iCloudShadowDensityLower;
uniform float iCloudShadowDensityHigher;
uniform vec3  iCloudShadowColor;


vec3 cloud_motion_offset(){
	return vec3(iCloudOffsetDirection.x, 0, iCloudOffsetDirection.y) * iTime * iMotionSpeed;
}


vec4 cloud_fbm_d(
	in vec3 pos
){
	vec4 result = fbm_3D_d(
		pos / iCloudHorizontalScale + cloud_motion_offset(),
		iCloudNumLayers,
		iCloudHorizontalShrink,
		0.5,
		iCloudVerticalShrink,
		iCloudFilterRange,
		iCloudNormalNumLayers
	);
	result *= iCloudMaxHeight;
	result.yzw /=  iCloudHorizontalScale;
	return result;
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

	vec3 gradient = vec3(0, sign(_p.y - center_y), 0);
	gradient -= fbm_d.yzw;
	gradient = normalize(gradient);

	d = min(-d + iCloudDensity, iCloudMaxDensity);
	return vec4(d, gradient);
}


vec4 inigo_raymarch_clouds(
	in  vec3  _camera_pos,
	in  vec3  _ray_dir,
	in  vec3  _sun_dir,
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
        PROFILE_CLOUD_RAYMARCH_STEPS();
		vec3 p = start + _ray_dir * t;
		float dt = max(iCloudMinStepSize, iCloudStepDistScale * t); // dynamic step size

		vec4 density_d = cloud_density_d(p);
		float density = density_d.x;
		if (density > 0.001){
			_cum_density += density * dt;
			vec3 color = vec3(iCloudBaseColor);

			// lighting
			vec3 normal = density_d.yzw;
			// shadow
			float shadow = 0.0; // 1.0 if in full shadow (black)
			for (int j = 1; j <= iCloudShadowSteps; j++){
				float shadow_t = float(j) * iCloudShadowStepSize;
				vec3 shadow_p = p + _sun_dir * shadow_t;
				float shadow_density = cloud_density_d(shadow_p).x;
				shadow += iCloudShadowStrength * 
					smoothstep(iCloudShadowDensityLower, iCloudShadowDensityHigher, shadow_density);
			}

			// ambient and diffuse
			color *= iCloudAmbient + iCloudDiffuse * dot(normal, _sun_dir);
			color = mix(color, iCloudShadowColor, shadow);

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
	// blend with sun
	cum_color.rgb += iCloudSunBlendStrength * iSunDiskColor 
		* (1.0 - iCloudSunBlendDensityFactor * cum_color.a)
		* pow(clamp(dot(_ray_dir, _sun_dir),0.0,1.0), iCloudSunBlendDotPower);

	return clamp(cum_color, 0.0, 1.0);
}



void inigo_render_clouds_i(
	in int _obj,
	in vec3 _camera_pos,
	in vec3 _view_ray,
	in vec3 _sun_dir,
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
		inigo_raymarch_clouds(_camera_pos, _view_ray, _sun_dir, cloud_density);

	// Blending //
	// float cloud_factor = 1 - exp(-cloud_density * iCloudObjBlendStrength);
	// cloud_factor = clamp(iCloudObjBlendStrength, 0.0, 1.0);
	// _color = mix(_color, cloud_color, cloud_factor);
	_color = (iCloudMaxCumAlpha - cloud_color.w)/iCloudMaxCumAlpha * _color 
		+ cloud_color.xyz * iCloudStrength;
}
