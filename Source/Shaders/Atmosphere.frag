uniform float iRayleighStrength;
// density 
uniform float iAtmosphereDensityFallOff;
uniform float iAtmosphereMaxHeight;
// sampling
uniform int iOpticalDepthSteps;
uniform int iRayleighSteps;
// blending with original color
uniform vec3 iRayleighFogFallOff;
uniform float iRayleighFogStrength;
// rayleigh scattering of RGB
uniform vec3 iScatteringCoefficient;

bool ray_inside_atmosphere_i(
	inout vec3 _start,
	inout vec3 _end
){
	if (_start.y > iAtmosphereMaxHeight && _end.y > iAtmosphereMaxHeight)
		return false;

	// TODO: what if ray.y == 0?
	vec3 ray = _end - _start;
	if (_start.y > iAtmosphereMaxHeight){
		_start = _start + ray * (iAtmosphereMaxHeight - _start.y) / ray.y;
	}

	if (_end.y > iAtmosphereMaxHeight){
		_end = _start + ray * (iAtmosphereMaxHeight - _start.y) / ray.y;
	}

	return true;
}


// returns 0-1
float atmosphere_density(
	in float _y
){
	_y += iAtmosphereMaxHeight; // move the ground level to 0
	return exp(-_y * 0.001 * iAtmosphereDensityFallOff) 
			* (iAtmosphereMaxHeight - 0.5 * _y) 
			/ iAtmosphereMaxHeight;
}


// sample the atmosphere density along a ray 
float optical_depth(
		in vec3 _start,
		in vec3 _end,
		in int _steps
){
	vec3 ray = _end - _start;
	float step_size = length(ray) / float(_steps);
	vec3 ray_dir = normalize(ray);

	float od = 0.0;
	for(float t = 0.0; t <= length(ray); t += step_size){
		float density = atmosphere_density((_start + ray_dir * t).y);
		od += density;
	}
	return od * step_size;
}


float rayleigh_phase_function(
	in vec3 _to_ray_origin,
	in vec3 _to_sun
){
	float cos_theta = dot(normalize(_to_ray_origin), normalize(_to_sun));
	return 0.75 * (1.0 + cos_theta * cos_theta);
}


// Pinpoint to: UNDEFINED BEHAVIOR inside
// when sun is inside atmosphere
vec3 rayleigh(
	in vec3 _start,
	in vec3 _end,
	in int _steps,
	in vec3 _sun_dir
){
	float ray_length = length(_end - _start);
	if (ray_length < 0.0001) 
		return vec3(0.0);

	vec3 ray = (_end - _start) / ray_length;
	float step_size = ray_length / float(_steps);

	vec3 rayleigh = vec3(0.0);
	for (float t = 0.01; t < ray_length - 0.01; t += step_size){
		vec3 scatter_point = _start + t * ray;

		//vec3 to_sun = _sun_pos - scatter_point;

		// only use the segment of the sun ray that is inside the atmosphere
		vec3 sun_end = scatter_point + _sun_dir * (iAtmosphereMaxHeight - scatter_point.y) / _sun_dir.y;
		bool sun_inside_atmos = ray_inside_atmosphere_i(scatter_point, sun_end);

		float od_sun = sun_inside_atmos
			? optical_depth(scatter_point, sun_end, iOpticalDepthSteps) 
			: 0.0;
		float od_eye = optical_depth(scatter_point, _start, iOpticalDepthSteps);

		float phase = rayleigh_phase_function(-ray, _sun_dir);
		rayleigh += atmosphere_density(scatter_point.y) 
			* exp(-(od_sun + od_eye) * iScatteringCoefficient)
			* iScatteringCoefficient * phase;
	}
	// since step_size is constant, we can factor it out
	return rayleigh * step_size;
}