uniform int iDebugRenderTarget;

#define DEFAULT_RENDER_TARGET 0
#define NOISE2D_RENDER_TARGET 1
#define DEPTH_RENDER_TARGET 2
#define OPTICAL_DEPTH_RENDER_TARGET 3
#define NOISE3D_RENDER_TARGET 4
#define NOISE1D_RENDER_TARGET 5
#define SPHERE_RENDER_TARGET 6
#define CIRCLE_RENDER_TARGET 7

// Noise 3D
uniform float iDebugNoise3DZ = 0;
// Depth
uniform float iDebugMaxRayDistance = 0;
uniform bool iDebugMarkNotInAtmosphere = false;
// Noise 1D
uniform float iDebugLineHeight = 0.003;
uniform float iDebugNoise1DZ = 0;

#include "Atmosphere.frag"
#include "Terrain.frag"
#include "Shading.frag"
#include "Raymarching.frag"
#include "Planet.frag"


bool debug_sphere(
	in vec2 _ndc,
	in vec3 _camera_pos,
	in vec3 _ray,
	in vec3 _sun_dir,
	out vec3 color_
){
	if (iDebugRenderTarget == SPHERE_RENDER_TARGET){
		color_ = vec3(0);
		float dist = raymarch_sphere(_camera_pos, _ray);
		if (dist > 0){
			vec3 pos = _camera_pos + _ray * dist;
			vec4 heightd = triplanar_mapping(pos);
			vec3 normal = heightd.yzw;

			// TODO: get normal and do lighting
			// color_ = vec3(heightd.x);
			// color_ = vec3(normal);

			float diffuse = max(dot(normal, _sun_dir), 0) + 0.1;
			color_ = vec3(diffuse);
		} else{
			color_ += sun_disk(_sun_dir, _camera_pos, _ray);
		}

		return true;
	}
	else if (iDebugRenderTarget == CIRCLE_RENDER_TARGET){
		color_ = vec3(0);
		float scale = 1 * pow(1.002,(_camera_pos.y+3000));
		vec2 pos = _ndc * scale
			+ 10 * vec2(-_camera_pos.x, _camera_pos.z);
		if (abs(planet_circle_sdf(pos, iDebugSphereRadius)) < 0.007 * scale){
			vec3 heightd = biplanar_mapping(normalize(pos) * iDebugSphereRadius);
			vec2 normal = heightd.yz;

			float diffuse = max(dot(vec3(normal.x, 0, normal.y), _sun_dir), 0);
			color_ = vec3(diffuse);
			//color_ = vec3(normal, 1);
		}
		return true;
	}
	return false;
}


bool debug_noises(
	in vec2 _ndc,
	in vec3 _camera_pos,
	in float _max_height,
	inout vec3 _color
) {

	if (iDebugRenderTarget == NOISE1D_RENDER_TARGET){
		_color = vec3(0, 0, 0);
		float scale = 1 * pow(1.002,(_camera_pos.y+3000));
		vec2 noise_pos = vec2(_ndc.x * scale, 0)
			+ vec2(-_camera_pos.x, iDebugNoise1DZ);
		vec4 fbm = terrain_fbm_d(noise_pos);
		float height = fbm.x;
		float y = _ndc.y * scale + _camera_pos.z;
		if (abs(y) < iDebugLineHeight * scale) {
			_color = vec3(0.5,0,0);
		}
		if (abs(y - height) < iDebugLineHeight * scale){
			_color = vec3(1);
		}
		return true;
	}
	if (iDebugRenderTarget == NOISE2D_RENDER_TARGET){
		float scale = 1 * pow(1.002,(_camera_pos.y+3000));
		vec2 noise_pos = _ndc * scale
			+ 10 * vec2(-_camera_pos.x, _camera_pos.z);
		vec4 fbm = terrain_fbm_d(noise_pos);
		float height = fbm.x;
		vec3 normal = fbm.yzw;
		_color = vec3((height / (_max_height + iGlobalMaxHeight) + 1) * 0.5);
		if (height < iWaterLevel){
			_color = vec3(0, 0, 0.5);
		}
		return true;
	}
	if (iDebugRenderTarget == NOISE3D_RENDER_TARGET){
		float scale = 1 * pow(1.002,(_camera_pos.y+3000));
		vec2 noise_pos = _ndc * scale
			+ 10 * vec2(-_camera_pos.x, _camera_pos.z);
		_color = vec3(
			(terrain_3D_fbm_d(vec3(noise_pos, iDebugNoise3DZ)).x
			/ _max_height + 1) * 0.5
		);
		return true;
	}
	return false;
}



bool debug_depth_and_od(
	in vec3 _start,
	in vec3 _end,
	in bool _in_atmosphere,
	inout vec3 _color
){
	if (iDebugRenderTarget == DEPTH_RENDER_TARGET){
		_color = vec3(distance(_start, _end) / iDebugMaxRayDistance);
		if (iDebugMarkNotInAtmosphere && !_in_atmosphere){
			_color.yz = vec2(0);
		}
		return true;
	}
	if (iDebugRenderTarget == OPTICAL_DEPTH_RENDER_TARGET){
		_color = vec3(optical_depth(_start, _end, 20)) / 10;
		return true;
	}
	return false;
}
