uniform bool iSkyUse2D;
// sky parameters
uniform vec3 iSkyColorTop;
uniform vec3 iSkyColorBot;
uniform float iCloudHeight;
uniform float iCloudScale;
uniform float iCloudLowerThreshold;
uniform float iCloudUpperThreshold;
uniform float iSkyFogStrength;
uniform vec3 iSkyFogColor;



bool two_d_sky_i(
	in vec2 _ndc,
	in vec3 _view_ray,
	in vec3 _camera_pos,
	inout vec3 _color
){
	if (!iSkyUse2D) return false;

	// gradient sky
	vec3 sky_color = mix(iSkyColorBot, iSkyColorTop, (_ndc.y + 1)/2);

	// simple 2D clouds
	// intersection with cloud plane
	float factor = iCloudHeight / _view_ray.y;
	vec3 cloud_pos = _camera_pos + factor * _view_ray;
	
	float cloud_noise = fbm_d(cloud_pos.xz / iCloudScale, 12).x;
	cloud_noise = smoothstep(
		iCloudLowerThreshold, iCloudUpperThreshold, cloud_noise);
	vec3 cloud_color = mix(sky_color, vec3(1), cloud_noise);

	// fog
	float distance_decay = 
		exp(-0.00002 * iSkyFogStrength * length(cloud_pos));
	cloud_color = mix(iSkyFogColor, cloud_color, distance_decay);

	_color += cloud_color;
	return true;
}