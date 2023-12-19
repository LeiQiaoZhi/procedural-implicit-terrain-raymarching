uniform float iAtmosphereDensityFallOff;
uniform float iAtmosphereMaxHeight;
uniform vec3 iScatteringCoefficient;

bool rayInsideAtmosphere(
	inout vec3 start,
	inout vec3 end
){
	if (start.y > iAtmosphereMaxHeight && end.y > iAtmosphereMaxHeight){
		return false;
	}

	// what if ray.y == 0?
	vec3 ray = end - start;
	if (start.y > iAtmosphereMaxHeight){
		start = start + ray * (iAtmosphereMaxHeight - start.y) / ray.y;
	}

	if (end.y > iAtmosphereMaxHeight){
		end = start + ray * (iAtmosphereMaxHeight - start.y) / ray.y;
	}

	return true;
}


// returns 0-1
float atmosphereDensity(in float y){
	y += iAtmosphereMaxHeight; // move the ground level to 0
	return exp(-y * 0.001 * iAtmosphereDensityFallOff) * (iAtmosphereMaxHeight - 0.5 * y) / iAtmosphereMaxHeight;
}

// sample the atmosphere density along a ray 
float opticalDepth(
		in vec3 start,
		in vec3 end,
		in int steps
){
	vec3 ray = end - start;
	float stepSize = length(ray) / float(steps);
	vec3 rayDir = normalize(ray);

	float od = 0.0;
	for(float t = 0.0; t <= length(ray); t+=stepSize){
		float density = atmosphereDensity((start + rayDir * t).y);
		od += density;
	}
	return od * stepSize;
}

vec3 rayleigh(
	in vec3 start,
	in vec3 end,
	in int steps,
	in vec3 sunPos
){
	vec3 ray = normalize(end - start);
	float rayLength = length(end - start);
	float stepSize = rayLength / float(steps);
	vec3 rayleigh = vec3(0.0);
	for (float t = 0.01; t < rayLength; t += stepSize){
		vec3 scatterPoint = start + t * ray;
		// rayleigh scattering
		// TODO: only up to top of atmosphere
		vec3 toSun = sunPos - scatterPoint;
		vec3 sunEnd = scatterPoint + toSun * (iAtmosphereMaxHeight - scatterPoint.y) / toSun.y;
		bool sunInsideAtmosphere = rayInsideAtmosphere(scatterPoint, sunEnd);
		float odSun = sunInsideAtmosphere
			? opticalDepth(scatterPoint, sunEnd, 10) 
			: 0.0;
		float odEye = opticalDepth(scatterPoint, start, 10);
		// TODO: consider theta
		 rayleigh += atmosphereDensity(scatterPoint.y) 
			* exp(-(odSun+odEye) * iScatteringCoefficient)
			* iScatteringCoefficient;
			// exp(-(odSun + odEye)) * stepSize;
	}
	return rayleigh * stepSize;
}