#version 330 core

#include "Debug.frag"
#include "Raymarching.frag"
#include "Atmosphere.frag"
#include "Clouds.frag"
#include "Sun.frag"
#include "TwoDSky.frag"

#define TERRAIN_OBJ 1
#define TREE_OBJ 2

out vec4 FragColor;

// global parameters
uniform float iTime;
uniform vec2 iResolution;

uniform float iFogStrength;
uniform vec3 iFogColor;

// material parameters
uniform vec3 iGrassColor = vec3(0.2, 0.4, 0.1);
uniform float iGrassThreshold;
uniform vec3 iDirtColor = vec3(0.8, 0.4, 0.3);
uniform float iDirtThreshold;



void main() 
{
	vec3 color = vec3(0.0);

	// set up coordinate system
	vec2 NDC = (gl_FragCoord.xy / min(iResolution.x, iResolution.y)) * 2.0 - 1.0; // [-1,1]

	// DEBUG noise
	if (debug_noises(NDC, iCameraPos, iMaxHeight, color)){
		FragColor = vec4(color, 1.0); return;
	}

	// naive way to prevent clipping through terrain
	float current_height = terrain_fbm_d(iCameraPos.xz).x;
	vec3 camera_pos = iCameraPos;
	camera_pos.y = max(current_height + 1, iCameraPos.y);
	vec3 ray = get_view_ray(NDC);

	vec3 sun_pos = get_sun_pos(camera_pos);

	// raymarching
	float tree_start_distance;
	float distance_to_terrain = 
		raymarchTerrain(camera_pos, ray, iMaxSteps, iStepSize, tree_start_distance);

	int obj = 0; // 0: sky, 1: terrain, 2: trees 
	float distance_to_obj = -1;
	if (distance_to_terrain > 0){
		obj = 1;
		distance_to_obj = distance_to_terrain;
	}
	if (tree_start_distance > 0 && iTreeEnabled){
		float distance_to_tree = 
			raymarch_trees(camera_pos, tree_start_distance, distance_to_terrain, ray);	
		if (distance_to_tree > 0){
			obj = 2;
			distance_to_obj = distance_to_tree;
		}
	}

	if (obj > 0)
	{
		vec3 pos = camera_pos + distance_to_obj * ray;
		vec4 heightd = terrain_fbm_d(pos.xz);
		if (obj == TERRAIN_OBJ){
			pos.y = heightd.x;
		}
		vec3 point_to_sun = normalize(sun_pos - pos);

		// normal
		vec3 normal = normalize(heightd.yzw);
		if (obj == TREE_OBJ){
			normal = normalize(treeNormal(pos) + iTreeNormalTerrainProportion * normal);
		}

		// material
		float grass_factor =  smoothstep_d(normal.y, iGrassThreshold, iDirtThreshold).x;
		vec3 material_color = grass_factor * iGrassColor
			+ (1 - grass_factor) * iDirtColor;

		if (obj == TREE_OBJ){
			material_color = iTreeColor;
		}

		// diffuse lighting
		color = max(0,dot(normal, point_to_sun)) * material_color;
			
		// shadow 
		float shadow_terrain = terrainShadow(pos + vec3(0, 0.1, 0), point_to_sun);
		color *= shadow_terrain;

		if (iTreeEnabled){
			float shadow_tree = treeShadow(pos + vec3(0, 0, 0), point_to_sun);
			color *= shadow_tree;
		}

		// fog
		float distance_decay = exp(-0.0002 * iFogStrength * distance_to_obj);
		color = mix(iFogColor, color, distance_decay);

		// post processing
		color = smoothstep(0.0, 1.0, color);
	}	
	else { // no hit, sky
		color += sun_disk(sun_pos, camera_pos, ray);

		if (two_d_sky_i(NDC, ray, camera_pos, color)) {
			FragColor = vec4(color, 1.0); return;
		}
	}

	inigo_render_clouds_i(obj, camera_pos, ray, color);
	
	if (distance_to_obj < 0){
		distance_to_obj = 100000;
	}

	vec3 start = camera_pos;
	vec3 end = camera_pos + ray * distance_to_obj;
	bool in_atmosphere = ray_inside_atmosphere_i(start, end);

	if (debug_depth_and_od(start, end, in_atmosphere, color)){
		FragColor = vec4(color, 1.0); return;
	}

	if (in_atmosphere){
		vec3 rayleigh = iRayleighStrength * rayleigh(start, end, iRayleighSteps, sun_pos);
		float view_ray_od = optical_depth(start, end, iOpticalDepthSteps);
		// blending with object color
		color = 
			color * exp(-view_ray_od * iRayleighFogFallOff * iRayleighFogStrength) 
			+ rayleigh;
	}

	FragColor = vec4(color, 1.0);
	return;
}
