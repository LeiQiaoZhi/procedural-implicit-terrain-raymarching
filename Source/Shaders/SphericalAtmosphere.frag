#include "Atmosphere.frag"
#include "Planet.frag"


// returns 0-1
float spherical_atmosphere_density(
	in vec3 _pos // relative to the planet center
){
    float height = length(_pos); // TODO: minus planet radius?
    return exp(-height * 0.0001 * iAtmosphereDensityFallOff) 
			* (iAtmosphereMaxHeight - height) 
			/ iAtmosphereMaxHeight;
}


// sample the atmosphere density along a ray 
float spherical_optical_depth(
		in vec3 _start,
		in vec3 _end,
		in int  _steps
){
	vec3 ray = _end - _start;
	float step_size = length(ray) / float(_steps);
	vec3 ray_dir = normalize(ray);

	float od = 0.0;
    float t = 0.0;
	for(int i = 0; i < _steps; i++){
		float density = spherical_atmosphere_density(_start + ray_dir * t);
		od += density;
        t += step_size;
	}
	return od * step_size;
}


bool ray_inside_spherical_atmosphere_i(
	inout vec3 _start,
	inout vec3 _end
){
    // if both points are inside the atmosphere, we're done
    vec3 start_to_end = _end - _start;
    float start_length = length(_start);
    float end_length = length(_end);
    if (start_length < iAtmosphereMaxHeight && end_length < iAtmosphereMaxHeight) {
        return true;
    }

	float s2 = dot(_start, _start); // s.x * s.x + s.y * s.y + s.z * s.z;
    float e2 = dot(_end, _end); // e.x * e.x + e.y * e.y + e.z * e.z;
    float se = dot(_start, _end); // s.x * e.x + s.y * e.y + s.z * e.z;

    // quadratic equation coefficients
    // a lambda^2 + b lambda + c = 0
    float a = s2 + e2 - 2.0 * se;
    float b = -2.0 * s2 + 2.0 * se;
    float c = s2 - iAtmosphereMaxHeight * iAtmosphereMaxHeight;

    // solve the quadratic equation
    float delta = b * b - 4.0 * a * c;
    if (delta < 0.0) {
        return false;
    }

    float lambda1 = (-b - sqrt(delta)) / (2.0 * a);
    float lambda2 = (-b + sqrt(delta)) / (2.0 * a);

    // check if the intersection points are on the segment
    if ((lambda1 < -0.001 || lambda1 > 1.001) 
        && start_length > iAtmosphereMaxHeight
    ) {
        return false;
    }

    vec3 original_start = _start;
    if (start_length > iAtmosphereMaxHeight){
        _start += lambda1 * (start_to_end);
    }

    if (end_length > iAtmosphereMaxHeight){
        _end = original_start + lambda2 * (start_to_end);
    }
    return true;
}


vec3 spherical_rayleigh(
	in vec3 _start,
	in vec3 _end,
	in int  _steps,
	in vec3 _sun_dir
){
	float ray_length = length(_end - _start);
	if (ray_length < 100) 
		return vec3(0.0);

	vec3 ray = (_end - _start) / ray_length;
	float step_size = ray_length / float(_steps);

	vec3 rayleigh = vec3(0.0);
    float t = 0.1;
	for (int i = 0; i < _steps; i++){
		vec3 scatter_point = _start + t * ray;

		vec3 sun_end = scatter_point + _sun_dir * 2 * iAtmosphereMaxHeight;
		bool sun_inside_atmos = ray_inside_spherical_atmosphere_i(scatter_point, sun_end);

		float od_sun = sun_inside_atmos
			? spherical_optical_depth(scatter_point, sun_end, iOpticalDepthSteps) 
			: 0.0;
		float od_eye = spherical_optical_depth(scatter_point, _start, iOpticalDepthSteps);

		float phase = rayleigh_phase_function(-ray, _sun_dir);
		rayleigh += spherical_atmosphere_density(scatter_point) 
			* exp(-(od_sun + od_eye) * iScatteringCoefficient)
			* iScatteringCoefficient * phase;
            
        t += step_size;
	}
	// since step_size is constant, we can factor it out
	return rayleigh * step_size;
}