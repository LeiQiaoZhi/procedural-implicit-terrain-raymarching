uniform int iDebugRenderTarget;

#define DEFAULT_RENDER_TARGET 0
#define NOISE2D_RENDER_TARGET 1
#define DEPTH_RENDER_TARGET 2
#define OPTICAL_DEPTH_RENDER_TARGET 3
#define NOISE3D_RENDER_TARGET 4
#define NOISE1D_RENDER_TARGET 5
#define SPHERE_RENDER_TARGET 6

// Noise 3D
uniform float iDebugNoise3DZ = 0;
// Depth
uniform float iDebugMaxRayDistance = 0;
uniform bool iDebugMarkNotInAtmosphere = false;
// Noise 1D
uniform float iDebugLineHeight = 0.003;
uniform float iDebugNoise1DZ = 0;
// Sphere
uniform float iDebugSphereRadius = 100;
uniform float iDebugTriplanarMappingSharpness = 1;

#include "Atmosphere.frag"
#include "Terrain.frag"
#include "Shading.frag"
#include "Raymarching.frag"


bool debug_sphere(
	in vec3 _camear_pos,
	in vec3 _ray,
	inout vec3 _color_
){
	if (iDebugRenderTarget == SPHERE_RENDER_TARGET){
		_color_ = vec3(0);
		float dist = raymarch_sphere(_camear_pos, _ray);
		if (dist > 0){
			// triplanar mapping
			vec3 pos = _camear_pos + dist * _ray; 
			vec3 normal = normalize(pos);
			vec2 xuv = pos.zy + sign(pos.x) * vec2(10000, 29000);
			vec2 yuv = pos.xz + sign(pos.y) * vec2(10000, 29000) * 2;
			vec2 zuv = pos.xy + sign(pos.z) * vec2(10000, 29000) * 3;
			float xheight = terrain_fbm_d(xuv).x;
			float yheight = terrain_fbm_d(yuv).x;
			float zheight = terrain_fbm_d(zuv).x;
			vec3 heights = vec3(xheight, yheight, zheight);
			heights = (heights / (iMaxHeight + iGlobalMaxHeight) + 1) * 0.5;
			vec3 weights = pow(abs(normal), vec3(iDebugTriplanarMappingSharpness));
			weights = weights / (weights.x + weights.y + weights.z);
			_color_ = vec3(dot(heights, weights));
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
