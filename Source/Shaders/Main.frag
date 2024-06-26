#version 330 core

out vec4 iFragColor;

// global parameters
uniform vec2 iResolution;

#include "Debug.frag"
#include "Atmosphere.frag"
#include "Clouds.frag"
#include "Raymarching.frag"
#include "Rocks.frag"
#include "TwoDSky.frag"
#include "Shading.frag"
#include "Motion.frag"
#include "Profiling.frag"
#include "IntersectionDistanceError.frag"
#include "HeightDifferenceError.frag"


void main() 
{
	vec3 color = vec3(0.0);

	// set up coordinate system
	//vec2 NDC = (gl_FragCoord.xy / min(iResolution.x, iResolution.y)) * 2.0 - 1.0; // [-1,1]
	vec2 NDC = (2 * gl_FragCoord.xy - iResolution) / min(iResolution.x, iResolution.y);

	if (debug_noises(NDC, iCameraPos, iMaxHeight, color)){
		iFragColor = vec4(color, 1.0); return;
	}

	// naive way to prevent clipping through terrain
	float current_height = terrain_fbm_smooth(iCameraPos.xz) + 200;
    // 1.1 * iTreeHeight + iTreeOffset + 0.5 * iTreeSizeRandomness.y;
	vec3 camera_pos = iCameraPos;
	camera_pos.y = max(current_height + 0.0, iCameraPos.y);
    vec3 pixel_world = get_pixel_world(camera_pos, NDC);
	vec3 ray = normalize(pixel_world - camera_pos);

	//vec3 sun_pos = get_sun_pos(camera_pos);
	//vec3 point_to_sun = normalize(sun_pos - camera_pos);
	vec3 point_to_sun = get_sun_dir(camera_pos);

    vec3 original_ray = normalize(get_pixel_world(iCameraPos, NDC) - iCameraPos);
	if (debug_sphere(NDC, iCameraPos, original_ray, get_sun_dir(iCameraPos), color)){
		iFragColor = vec4(color, 1.0); 
        if (show_profile_colors(color)) {
            iFragColor = vec4(color, 1.0); return;
        }
        return;
	}

	if (point_to_sun.y < -0.12) return; // sun below horizon

	// raymarching
	float tree_start_distance;
	float distance_to_terrain = 
		raymarch_terrain(camera_pos, ray, iMaxDistance, 
                        iStepSize, tree_start_distance);


    vec4 ide_color;
    if (render_intersection_distance_error(distance_to_terrain, camera_pos, ray, ide_color)){
        iFragColor = ide_color; return;
    }
    vec4 hde_color;
    if (render_height_diffrence_error(distance_to_terrain, camera_pos, ray, hde_color)){
        iFragColor = hde_color; return;
    }


	int obj = 0; // 0: sky, 1: terrain, 2: trees 
	float distance_to_obj = -1;
	int tree_species = 0;
	float tree_age, rel_tree_height;
	if (distance_to_terrain > 0){
		obj = 1;
		distance_to_obj = distance_to_terrain;
	}
	if (tree_start_distance > 0 && iTreeEnabled){
		float distance_to_tree = 
			raymarch_trees(camera_pos, tree_start_distance, distance_to_terrain, 
				ray, tree_species, tree_age, rel_tree_height);	
		if (distance_to_tree > 0){
			obj = 2;
			distance_to_obj = distance_to_tree;
		}
	}

	// shading
	if (obj > 0)
	{
		color += shade(
			obj, camera_pos, distance_to_obj, point_to_sun, 
			ray, tree_species, tree_age, rel_tree_height);
	}	
	else { // no hit, sky
		color += sun_disk(point_to_sun, camera_pos, ray);

		if (two_d_sky_i(NDC, ray, camera_pos, color)) {
			iFragColor = vec4(color, 1.0); return;
		}
	}
	
	// atmosphere
	if (distance_to_obj < 0){
		distance_to_obj = 100000;
	}
	// too close, don't bother
	if (distance_to_obj > 100 && iRayleighStrength > 0.0001){
		vec3 start = camera_pos;
		vec3 end = camera_pos + ray * distance_to_obj;
		bool in_atmosphere = ray_inside_atmosphere_i(start, end);

		if (debug_depth_and_od(start, end, in_atmosphere, color)){
			iFragColor = vec4(color, 1.0); return;
		}

		if (in_atmosphere){
			vec3 rayleigh = iRayleighStrength * rayleigh(start, end, iRayleighSteps, point_to_sun);
			float view_ray_od = optical_depth(start, end, iOpticalDepthSteps);
			// blending with object color
			color = 
				color * exp(-view_ray_od * iRayleighFogFallOff * iRayleighFogStrength) 
				+ rayleigh;
		}
	}

	// higher 2D clouds
	two_d_clouds_i(obj, ray, camera_pos, color);
	// lower 3D clouds
	inigo_render_clouds_i(obj, camera_pos, ray, point_to_sun, color);

    // debug profiling
    if (show_profile_colors(color)) {
        iFragColor = vec4(color, 1.0); return;
    }

	iFragColor = vec4(color, 1.0);
	return;
}
