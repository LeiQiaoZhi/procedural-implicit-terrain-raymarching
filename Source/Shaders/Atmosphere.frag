// #include "Constants.frag"

uniform float iRayleighStrength;

uniform int iOpticalDepthSteps;
uniform int iRayleighSteps;

uniform float iAtmosphereDensityFallOff;
uniform float iAtmosphereMaxHeight;

uniform vec3 iRayleighFogFallOff;
uniform float iRayleighFogStrength;

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


float rayleighPhaseFunction(
	in vec3 toRayStart,
	in vec3 toSun
){
	float cosTheta = dot(normalize(toRayStart), normalize(toSun));
	return 0.75 * (1.0 + cosTheta * cosTheta);
}


// Pinpoint to: UNDEFINED BEHAVIOR inside
// when sun is inside atmosphere
vec3 rayleigh(
	in vec3 start,
	in vec3 end,
	in int steps,
	in vec3 sunPos
){
	float rayLength = length(end - start);
	if (rayLength < 0.0001) {
		return vec3(0.0);
	}
	vec3 ray = (end - start) / rayLength;
	float stepSize = rayLength / float(steps);
	vec3 rayleigh = vec3(0.0);
	for (float t = 0.01; t < rayLength - 0.01; t += stepSize){
		vec3 scatterPoint = start + t * ray;
		// rayleigh scattering
		// TODO: only up to top of atmosphere
		vec3 toSun = sunPos - scatterPoint;
		if (toSun.y < 0.01) { // sun is below the horizon
			continue;
		}
		vec3 sunEnd = scatterPoint + toSun * (iAtmosphereMaxHeight - scatterPoint.y) / toSun.y;
		bool sunInsideAtmosphere = rayInsideAtmosphere(scatterPoint, sunEnd);

		float odSun = sunInsideAtmosphere
			? opticalDepth(scatterPoint, sunEnd, iOpticalDepthSteps) 
			: 0.0;
		float odEye = opticalDepth(scatterPoint, start, iOpticalDepthSteps);

		float phase = rayleighPhaseFunction(-ray, toSun);
		rayleigh += atmosphereDensity(scatterPoint.y) 
			* exp(-(odSun+odEye) * iScatteringCoefficient)
			* iScatteringCoefficient * phase;
	}
	return rayleigh * stepSize;
}