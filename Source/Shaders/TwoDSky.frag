uniform bool iSkyUse2D;
uniform bool iUse2DClouds;
// sky parameters
uniform vec3 iSkyColorTop;
uniform vec3 iSkyColorBot;
uniform float iCloudHeight;
uniform float iCloudScale;
uniform float iCloudLowerThreshold;
uniform float iCloudUpperThreshold;
uniform float iSkyFogStrength;
uniform vec3 iSkyFogColor;



void two_d_clouds_i(
	in int _obj,
	in vec3 _view_ray,
	in vec3 _camera_pos,
	inout vec3 _color_
){
	if (!iUse2DClouds) return;
	// intersection with cloud plane
	if ((_camera_pos.y < iCloudHeight && (_view_ray.y < 0.001 || _obj > 0)) ||
		(_camera_pos.y > iCloudHeight && _view_ray.y > -0.001))
		return;
	float factor = iCloudHeight / _view_ray.y;
	vec3 cloud_pos = _camera_pos + factor * _view_ray;
	// 2d fbm
	float cloud_noise = fbm_d(cloud_pos.xz / iCloudScale, 12).x;
	cloud_noise = smoothstep(
		iCloudLowerThreshold, iCloudUpperThreshold, cloud_noise);
	vec3 cloud_color = mix(_color_, vec3(1), cloud_noise);
	// fog
	float distance_decay = 
		exp(-0.00002 * iSkyFogStrength * length(cloud_pos));
	cloud_color = mix(_color_, cloud_color, distance_decay);
	_color_ = cloud_color;
}



bool two_d_sky_i(
	in vec2 _ndc,
	in vec3 _view_ray,
	in vec3 _camera_pos,
	inout vec3 _color_
){
	if (!iSkyUse2D) return false;

	// gradient sky
	vec3 sky_color = mix(iSkyColorBot, iSkyColorTop, (_ndc.y + 1)/2);

	two_d_clouds_i(0, _view_ray, _camera_pos, sky_color);
	
	_color_ += sky_color;
	return true;
}

