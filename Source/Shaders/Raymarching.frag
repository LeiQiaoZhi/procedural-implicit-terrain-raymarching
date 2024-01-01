#version 330 core

#include "Tree.frag"
#include "Atmosphere.frag"
#include "Debug.frag"
#include "Clouds.frag"

out vec4 FragColor;

// global parameters
uniform float iTime;
uniform vec2 iResolution;

// camera parameters
uniform vec3 iCameraPos;
uniform vec3 iCameraFwd; 
uniform vec3 iCameraRight; 
uniform vec3 iCameraUp; 
uniform float iFocalLength;

// raymarching parameters
uniform int iMaxSteps;
uniform float iStepSize;

uniform int iShadowSteps;
uniform float iFogStrength;
uniform vec3 iFogColor;

// tree parameters
uniform bool iTreeEnabled;
uniform vec3 iTreeColor;
uniform float iTreeNormalTerrainProportion;

// light parameters
uniform vec3 iSunPos = vec3(200, 2000.0, 3000.0);

// material parameters
uniform vec3 iGrassColor = vec3(0.2, 0.4, 0.1);
uniform float iGrassThreshold;
uniform vec3 iDirtColor = vec3(0.8, 0.4, 0.3);
uniform float iDirtThreshold;

// sky parameters
uniform vec3 iSkyColorTop;
uniform vec3 iSkyColorBot;
uniform float iCloudHeight;
uniform float iCloudScale;
uniform float iCloudLowerThreshold;
uniform float iCloudUpperThreshold;
uniform float iSkyFogStrength;
uniform vec3 iSkyFogColor;

// sun position
uniform float iTheta;
uniform float iPhi;
uniform float iRadius;

// sun
uniform bool iEnableSunDisk;
uniform float iSunDiskThreshold;
uniform vec3 iSunDiskColor;
uniform int iSunDiskDotPower;

// returns the distance to the terrain 
float raymarchTerrain(
	in vec3 pos,
	in vec3	ray,
	in int maxSteps,
	in float stepSize,
	out float tTree // distance to intersection with tree
){
	// TODO: use max terrain height and max tree height to determine max distance

	tTree = -1; // no tree hit

	vec3 origin = pos;
	float clipNear = 0.1;
	float lastHeight;
	float lastY;
	float treeMaxHeight = 1.0 * iTreeHeight + iTreeOffset + 0.5 * iTreeSizeRandomness.y; 

	for (float t = clipNear; t < maxSteps * stepSize; t += stepSize) 
	{
		pos = origin + t * ray;

		float height = terraind(pos.xz).x;
		float treeHeight = height + treeMaxHeight;

		// check for tree intersection
		if (tTree < 0 && pos.y < treeHeight)
		{
			// interpolation
			tTree = t - stepSize * 
				(treeHeight - pos.y) /
				(lastY - lastHeight - treeMaxHeight + treeHeight - pos.y); 	
			// tTree = t - 1 * stepSize;
		}

		// check for terrain intersection
		if (pos.y < height) 
		{
			// interpolation
			t -= stepSize * 
				(height - pos.y) / (lastY - lastHeight + height - pos.y);

			return t;
		}

		lastHeight = height;
		lastY = pos.y;

	}
	return -1;
}

float terrainShadow(in vec3 pos, in vec3 pointToSun){
	// shadow ray
	float shadowStepSize = 1;
	float minR = 1;
	for (float t = 1; t < iShadowSteps * shadowStepSize; t += shadowStepSize) 
	{
		vec3 shadowPos = pos + t * pointToSun;
		float d = shadowPos.y - terraind(shadowPos.xz).x;
		minR = min(minR, 2 * d / t);

		if (minR < 0.001){
			break;
		}
	}

	float shadow = smoothstep(0.0, 1.0, minR);
	return shadow;
}


void main() 
{
	vec3 sunPos = iRadius * vec3(
		sin(iTheta) * cos(iPhi),
		cos(iTheta),
		sin(iTheta) * sin(iPhi)
	);

	vec3 color = vec3(0.0);

	// set up coordinate system
	vec2 NDC = (gl_FragCoord.xy / min(iResolution.x, iResolution.y)) * 2.0 - 1.0; // [-1,1]

	// DEBUG noise
	if (iDebugRenderTarget == NOISE2D_RENDER_TARGET){
		float scale = 1 * pow(1.002,(iCameraPos.y+3000));
		vec2 noise_pos = NDC * scale
			+ 10 * vec2(-iCameraPos.x, iCameraPos.z);
		color = vec3((terraind(noise_pos).x / iMaxHeight + 1) * 0.5);
		FragColor = vec4(color,1.0);	
		return;
	}
	if (iDebugRenderTarget == NOISE3D_RENDER_TARGET){
		float scale = 1 * pow(1.002,(iCameraPos.y+3000));
		vec2 noise_pos = NDC * scale
			+ 10 * vec2(-iCameraPos.x, iCameraPos.z);
		color = vec3((terrain(vec3(noise_pos, iDebugNoise3DZ)) / iMaxHeight + 1) * 0.5);
		FragColor = vec4(color,1.0);	
		return;
	}

	// naive way to prevent clipping through terrain
	float currentHeight = terraind(iCameraPos.xz).x;
	vec3 cameraPos = iCameraPos;
	cameraPos.y = max(currentHeight + 1, iCameraPos.y);
	vec3 screenCenter = cameraPos + normalize(iCameraFwd) * iFocalLength;
	vec3 pixelWorld = screenCenter 
		+ NDC.x * normalize(iCameraRight) + NDC.y * normalize(iCameraUp);
	vec3 ray = normalize(pixelWorld - cameraPos);

	// raymarching
	float distanceToTree;
	float distanceToTerrain = raymarchTerrain(cameraPos, ray, iMaxSteps, iStepSize, distanceToTree);

	int obj = 0; // 0: sky, 1: terrain, 2: trees 
	float distanceToObj = -1;
	if (distanceToTerrain > 0){
		obj = 1;
		distanceToObj = distanceToTerrain;
	}
	if (distanceToTree > 0 && iTreeEnabled){
		// detailed raymarching of trees SDF
		for (int i = 0; i < iTreeSteps; i++){
			vec3 pos = cameraPos + distanceToTree * ray;
			float d = treeSDF(pos);
			// occulusion by terrain
			if (distanceToTree > distanceToTerrain && distanceToTerrain > 0){
				break;
			}
			// hit
			if (d < 0.001 * distanceToTree){
				obj = 2;
				distanceToObj = distanceToTree;
				break;
			}
			distanceToTree += min(d,iDomainSize);
		}
	}

	if (obj > 0)
	{
		vec3 pos = cameraPos + distanceToObj * ray;
		vec4 heightd = terraind(pos.xz);
		if (obj == 1){
			pos.y = heightd.x;
		}
		vec3 pointToSun = normalize(sunPos - pos);

		// normal
		vec3 normal = normalize(heightd.yzw);
		if (obj == 2){
			normal = normalize(treeNormal(pos) + iTreeNormalTerrainProportion * normal);
		}

		// material
		float grassFactor =  smoothstepd(normal.y, iGrassThreshold, iDirtThreshold).x;
		vec3 matColor = grassFactor * iGrassColor
			+ (1 - grassFactor) * iDirtColor;

		if (obj == 2){
			matColor = iTreeColor;
		}

		// diffuse lighting
		color = max(0,dot(normal, pointToSun)) * matColor;
			
		// shadow 
		float terShadow = terrainShadow(pos + vec3(0, 0.1, 0), pointToSun);
		color *= terShadow;

		if (iTreeEnabled){
			float trShadow = treeShadow(pos + vec3(0, 0, 0), pointToSun);
			color *= trShadow;
		}

		// fog
		float distanceDecay = exp(-0.0002 * iFogStrength * distanceToObj);
		color = mix(iFogColor, color, distanceDecay);

		// post processing
		color = smoothstep(0.0, 1.0, color);
	}	
	else { // no hit, sky
		if (iEnableSunDisk){
			vec3 sun_ray = normalize(sunPos - cameraPos);
			float sun_dot = dot(ray, sun_ray);
			if (100 * sun_dot > iSunDiskThreshold){
				color += iSunDiskColor
							* pow(max(0, dot(ray, sun_ray)), iSunDiskDotPower);
			}
		}
	}
	}

	if (distanceToObj < 0){
		distanceToObj = 100000;
	}

	vec3 start = cameraPos;
	vec3 end = cameraPos + ray * distanceToObj;
	bool inAtmosphere = rayInsideAtmosphere(start, end);
	// inAtmosphere = false;

	if (iDebugRenderTarget == DEPTH_RENDER_TARGET){
		color = vec3(distance(start,end)/iDebugMaxRayDistance);
		if (iDebugMarkNotInAtmosphere && !inAtmosphere){
			color.yz = vec2(0);
		}
		FragColor = vec4(color, 1.0); return;
	}
	if (iDebugRenderTarget == OPTICAL_DEPTH_RENDER_TARGET){
		color = vec3(opticalDepth(start, end, 20)) / 10;
		FragColor = vec4(color, 1.0); return;
	}
	if (inAtmosphere){
		vec3 rayleigh = iRayleighStrength * rayleigh(start, end, iRayleighSteps, sunPos);
		float viewRayOpticalDepth = opticalDepth(start, end, iOpticalDepthSteps);
		// viewRayOpticalDepth = 100000.0;
		// color = vec3(distance(start,end)/iDebugMaxRayDistance);
		// color = vec3(viewRayOpticalDepth)/10;
		color = color * exp(-viewRayOpticalDepth * iRayleighFogFallOff * iRayleighFogStrength) + rayleigh;
	}
	FragColor = vec4(color, 1.0);
	return;

	/// OLD CODE ///

	// sun
	vec3 camToSun = normalize(sunPos - cameraPos);
	if (dot(camToSun, ray) > 0.995) 
	{
		FragColor = vec4(0.8, 0.4, 0.1, 1.0);
		return;
	}

	// light blue sky
    vec3 skyColor = mix(iSkyColorBot, iSkyColorTop,  (NDC.y + 1)/2);
	// simple clouds
	float factor = iCloudHeight / ray.y;
	vec3 cloudPos = cameraPos + factor * ray;
	
	float cloudNoise = fbmd(cloudPos.xz / iCloudScale, 12).x;
	cloudNoise = smoothstep(iCloudLowerThreshold, iCloudUpperThreshold, cloudNoise);
	vec3 cloudColor = mix(skyColor, vec3(1), cloudNoise);

	// fog
	// TODO: blend with terrain siluette
	float distanceDecay = exp(-0.00002 * iSkyFogStrength * length(cloudPos));
	cloudColor = mix(iSkyFogColor, cloudColor, distanceDecay);

	FragColor = vec4(cloudColor, 1.0);
}
