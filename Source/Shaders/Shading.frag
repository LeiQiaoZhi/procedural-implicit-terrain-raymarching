#include "Tree.frag"
#include "Sun.frag"

#define TERRAIN_OBJ 1
#define TREE_OBJ 2

// material parameters
uniform vec3 iGrassColor = vec3(0.2, 0.4, 0.1);
uniform float iGrassThreshold;
uniform vec3 iDirtColor = vec3(0.8, 0.4, 0.3);
uniform float iDirtThreshold;
// terrain lighting
uniform float iFresnelNormalIncidence;
uniform int iFresnelDotPower;
uniform int iSpecularDotPower;
uniform float iAmbientStrength;
uniform float iDiffuseStrength;
uniform float iSpecularStrength;
// tree lighting
uniform float iTreeFresnelNormalIncidence;
uniform int iTreeFresnelDotPower;
uniform int iTreeSpecularDotPower;
uniform float iTreeAmbientStrength;
uniform float iTreeDiffuseStrength;
uniform float iTreeSpecularStrength;
uniform float iTreeOcculusionLower;
uniform float iTreeOcculusionUpper;
// deprecated -- atmosphere simulates fog
uniform float iFogStrength;
uniform vec3 iFogColor;
// optimization
uniform float iShadeShadowThreshold;


vec3 shade_terrain(
	in vec3 _pos,	
	in vec3 _point_to_sun,
	in vec3 _view_ray,
	in vec3 _normal
)
{
	vec3 color = vec3(0.0);

	// material
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
	// bumps


	// grass
	float grass_factor = smoothstep_d(_normal.y, iGrassThreshold, iDirtThreshold).x;
	material_color = grass_factor * iGrassColor
		+ (1 - grass_factor) * material_color;

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
	in float _distance_to_obj,
	in vec3 _point_to_sun,
	in vec3 _view_ray,
	in int _tree_species,
	in float _tree_age,
	in float _rel_tree_height
){
	vec3 color = vec3(0.0);
	vec3 pos = _camera_pos + _distance_to_obj * _view_ray;
	vec4 heightd = terrain_fbm_d(pos.xz);
	vec3 normal = normalize(heightd.yzw);
	if (_obj == TERRAIN_OBJ) pos.y = heightd.x;

	// shadow 
	float shadow = terrainShadow(pos + vec3(0, 0.1, 0), _point_to_sun);

	if (iTreeEnabled){
		shadow *= treeShadow(pos + vec3(0, 0, 0), _point_to_sun);
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

	// fog -- not in use
	float distance_decay = exp(-0.0002 * iFogStrength * _distance_to_obj);
	color = mix(iFogColor, color, distance_decay);

	// post processing
	color = smoothstep(0.0, 1.0, color);
	return color;
}
