#include "Shading.frag"
#include "Tree.frag"
#include "Sun.frag"
#include "Rocks.frag"
#include "Water.frag"
#include "TerrainMaterial.frag"

vec3 shade_planet_terrain(
	in vec3 _pos,	
	in vec3 _point_to_sun,
	in vec3 _view_ray,
	in vec3 _normal
)
{
	vec3 color = vec3(0.0);

	// rock
	// 2 stripes
	vec3 material_color = mix(
		iRockColor1, 
		iRockColor2, 
		0.5 * noise_d(0.1 * vec2(
			_pos.x * iRockStripeHorizontalScale,
			_pos.y * iRockStripeVerticalScale 
		)).x + 0.5 // [0,1]
	);
	// noise texture
	float xz_noise = noise(0.01 * iRockXZNoiseScale * _pos.xz);
	material_color *= iRockXZNoiseBase + iRockXZNoiseStrength * pow(xz_noise,2);
	// hide stripes in flat areas
	material_color = mix(
		material_color, 
		iRockHideStripeColor,
		smoothstep(iRockHideStripeNormalLower, iRockHideStripeNormalUpper, _normal.y)
	);

	float grass_min_height = iGrassMinHeight + grass_edge_fbm(_pos.xz) * iGrassEdgeFbmStrength;
	if (_pos.y < grass_min_height + iSandUpperFadeLength){
		material_color = iSandColor;
		if (_pos.y > grass_min_height){
			// fade on both ends
			material_color = mix(
				material_color, 
				iDirtColor,
				smoothstep(grass_min_height, grass_min_height + iSandUpperFadeLength, _pos.y)
			);
		}
	}

	// grass
	if (_pos.y < iGrassMaxHeight && _pos.y > grass_min_height){
		// color variety
		float grass_color_fbm = grass_color_fbm(_pos.xz);
		vec3 grass_color = mix(iGrassColor, iGrassColor2, grass_color_fbm);
		float grass_factor = smoothstep_d(_normal.y, iGrassThreshold, iDirtThreshold).x;
		// fade on both ends
		if (_pos.y < grass_min_height + iGrassLowerFadeLength){
			grass_factor *= smoothstep(
				grass_min_height, grass_min_height + iGrassLowerFadeLength, _pos.y);
		}
		if (_pos.y > iGrassMaxHeight - iGrassUpperFadeLength){
			grass_factor *= 1 - smoothstep(
				iGrassMaxHeight - iGrassUpperFadeLength, iGrassMaxHeight, _pos.y);
		}
		// mix on grass normal
		material_color = mix(
			material_color, 
			grass_color,
			clamp(grass_factor, 0, 1)
		);
	}

	// lighting
	float diffuse = clamp(dot(_normal, _point_to_sun),0,1) * iDiffuseStrength;
	color = material_color * (iAmbientStrength + diffuse);

	float fresnel = iFresnelNormalIncidence + 
		(1 - iFresnelNormalIncidence) * pow(1+dot(_normal, _view_ray), iFresnelDotPower);
	vec3 reflect_ray = reflect(_view_ray, _normal);
	float specular = pow(clamp(dot(reflect_ray, _point_to_sun),0,1), iSpecularDotPower) * fresnel; 
	color += iSunDiskColor * iSpecularStrength * specular;

	return color;
}

vec3 shade_planet(
	in vec3 _pos,
	in vec3 _view_ray,
	in vec3 _point_to_sun,
	in vec3 _normal,
	in vec3 _camera_pos,
    inout float _distance_to_obj_
){
    vec3 color = vec3(0.0);
    float height = length(_pos) - iPlanetRadius;
    vec3 material_color = vec3(0,0.8,0);

    // lighting
	float diffuse = clamp(dot(_normal, _point_to_sun),0,1) * iDiffuseStrength;
	color = material_color * (iAmbientStrength + diffuse);

	float fresnel = iFresnelNormalIncidence + 
		(1 - iFresnelNormalIncidence) * pow(1+dot(_normal, _view_ray), iFresnelDotPower);
	vec3 reflect_ray = reflect(_view_ray, _normal);
	float specular = pow(clamp(dot(reflect_ray, _point_to_sun),0,1), iSpecularDotPower) * fresnel; 
	color += iSunDiskColor * iSpecularStrength * specular;


	if (height < iWaterLevel){
		// calculate position of intersection with water surface
        bool inside_water = ray_inside_sphere_i(_camera_pos, _pos, iWaterLevel + iPlanetRadius);
        if (!inside_water) 
            return RED;

		vec3 water_pos = _pos;
        float distance_to_water = distance(_camera_pos, water_pos);
		float depth = length(water_pos) - triplanar_mapping(water_pos).x;
		float water_length = _distance_to_obj_ - distance_to_water;
		float water_transmittance = exp(-iWaterTransmittanceDecay * water_length * 0.0001);
		// deep vs shallow water color
		vec3 water_color = mix(iWaterDeepColor, iWaterShallowColor, depth/iWaterLevel);
		// transparency
		color = mix(water_color, color, 
			max(iWaterInitialTransparency * water_transmittance - iWaterTransparencyDecrease, 0));
		// update for atmosphere calculation
		_distance_to_obj_ = max(distance_to_water,0);

		// lighting
		// vec3 water_normal = water_normal_map(_pos);
		vec3 water_normal = normalize(_pos);
		float diffuse = clamp(dot(water_normal, _point_to_sun),0,1) * iWaterDiffuseStrength;
		color *= (iWaterAmbientStrength + diffuse);

		float fresnel = iWaterFresnelNormalIncidence + 
			(1 - iWaterFresnelNormalIncidence) * pow(1+dot(water_normal, _view_ray), iWaterFresnelDotPower);
		vec3 reflect_ray = reflect(_view_ray, water_normal);
		float specular = pow(clamp(dot(reflect_ray, _point_to_sun),0,1), iWaterSpecularDotPower) * fresnel; 
		color += iSunDiskColor * iWaterSpecularStrength * specular;
		if (iWaterShadowOn){
			// shadow = terrain_shadow(water_pos + vec3(0, 0.1, 0), _point_to_sun);
			// color *= shadow;
		}
	} else if (height < iWaterLevel + 2){
        // foam line
        // color = WHITE;
    }
    


	return color;
}
