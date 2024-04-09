#include "Tree.frag"
#include "Sun.frag"
#include "Rocks.frag"
#include "Water.frag"
#include "TerrainMaterial.frag"

#define TERRAIN_OBJ 1
#define TREE_OBJ 2

// terrain lighting
uniform float iFresnelNormalIncidence;
uniform int   iFresnelDotPower;
uniform int   iSpecularDotPower;
uniform float iAmbientStrength;
uniform float iDiffuseStrength;
uniform float iSpecularStrength;
// tree lighting
uniform float iTreeFresnelNormalIncidence;
uniform int   iTreeFresnelDotPower;
uniform int   iTreeSpecularDotPower;
uniform float iTreeAmbientStrength;
uniform float iTreeDiffuseStrength;
uniform float iTreeSpecularStrength;
uniform float iTreeOcculusionLower;
uniform float iTreeOcculusionUpper;
// deprecated -- atmosphere simulates fog
uniform float iFogStrength;
uniform vec3  iFogColor;
// optimization
uniform float iShadeShadowThreshold;

// TODO: extract water
uniform int iWaterLevel;


vec3 shade_terrain(
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


vec3 shade_tree(
	in vec3 _pos,	
	in vec3 _point_to_sun,
	in vec3 _view_ray,
	in vec3 _terrain_normal,
	in int _tree_species,
	in float _tree_age,
	in float _rel_tree_height
){
	vec3 color = vec3(0.0);
	vec3 normal = normalize(treeNormal(_pos) + iTreeNormalTerrainProportion * _terrain_normal);

	// color variation among tree species
	vec3 material_color = (_tree_species == TREE_SPECIES_1) ? iTreeColor : iTreeColorS2;
	material_color = mix(material_color, 
				(_tree_species == TREE_SPECIES_1) ? iTreeOldColor : iTreeOldColorS2, 
				_tree_age);

	// lighting
	float occulusion = smoothstep(iTreeOcculusionLower, iTreeOcculusionUpper, _rel_tree_height);
	float diffuse = clamp(dot(normal, _point_to_sun),0,1) * iTreeDiffuseStrength * occulusion;
	color = material_color * (iTreeAmbientStrength + diffuse);

	float fresnel = iTreeFresnelNormalIncidence + 
		(1 - iTreeFresnelNormalIncidence) * pow(1+dot(normal, _view_ray), iTreeFresnelDotPower);
	vec3 reflect_ray = reflect(_view_ray, normal);
	float specular = pow(clamp(dot(reflect_ray, _point_to_sun),0,1), iTreeSpecularDotPower) * fresnel; 
	color += iSunDiskColor * iTreeSpecularStrength * specular;

	return color;
}


vec3 shade(
	in int _obj,
	in vec3 _camera_pos,
	inout float _distance_to_obj_,
	in vec3 _point_to_sun,
	in vec3 _view_ray,
	in int _tree_species,
	in float _tree_age,
	in float _rel_tree_height
){
	vec3 color = vec3(0.0);
	vec3 pos = _camera_pos + _distance_to_obj_ * _view_ray;
	vec4 heightd = terrain_fbm_d(pos.xz);
	vec3 normal = normalize(heightd.yzw);
	if (_obj == TERRAIN_OBJ) pos.y = heightd.x;

	// shadow 
	float shadow = terrain_shadow(pos + vec3(0, 0.1, 0), _point_to_sun);

	if (iTreeEnabled){
		shadow *= tree_shadow(pos + vec3(0, 0, 0), _point_to_sun);
	}
    
	if (shadow >= iShadeShadowThreshold){
	    if (_obj == TERRAIN_OBJ){
			color = shade_terrain(pos, _point_to_sun, _view_ray, normal);
		}
		else if (_obj == TREE_OBJ){
			color = shade_tree(pos, _point_to_sun, _view_ray, normal, _tree_species, _tree_age, _rel_tree_height);
		}
		color *= shadow;
	}

	if (pos.y < iWaterLevel){
		// calculate position of intersection with water surface
		float distance_to_water = (iWaterLevel - _camera_pos.y) / _view_ray.y;
		vec3 water_pos = _camera_pos + distance_to_water * _view_ray;
		float depth = water_pos.y - terrain_fbm(water_pos.xz);
		float water_length = _distance_to_obj_ - distance_to_water;
		float water_transmittance = exp(-iWaterTransmittanceDecay * water_length * 0.001);
		// deep vs shallow water color
		vec3 water_color = mix(iWaterDeepColor, iWaterShallowColor, water_transmittance);
		// transparency
		color = mix(water_color, color, 
			max(iWaterInitialTransparency * water_transmittance - iWaterTransparencyDecrease, 0));
		// update for atmosphere calculation
		_distance_to_obj_ = max(distance_to_water,0);

		// lighting
		vec3 water_normal = water_normal_map(pos);
		float diffuse = clamp(dot(water_normal, _point_to_sun),0,1) * iWaterDiffuseStrength;
		color *= (iWaterAmbientStrength + diffuse);

		float fresnel = iWaterFresnelNormalIncidence + 
			(1 - iWaterFresnelNormalIncidence) * pow(1+dot(water_normal, _view_ray), iWaterFresnelDotPower);
		vec3 reflect_ray = reflect(_view_ray, water_normal);
		float specular = pow(clamp(dot(reflect_ray, _point_to_sun),0,1), iWaterSpecularDotPower) * fresnel; 
		color += iSunDiskColor * iWaterSpecularStrength * specular;
		if (iWaterShadowOn){
			shadow = terrain_shadow(water_pos + vec3(0, 0.1, 0), _point_to_sun);
			color *= shadow;
		}

	}

	// fog -- not in use
	float distance_decay = exp(-0.0002 * iFogStrength * _distance_to_obj_);
	color = mix(iFogColor, color, distance_decay);

	// post processing
	color = smoothstep(0.0, 1.0, color);
	return color;
}
