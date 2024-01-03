#include "Atmosphere.frag"
#include "Terrain.frag"

uniform int iDebugRenderTarget;

#define DEFAULT_RENDER_TARGET 0
#define NOISE2D_RENDER_TARGET 1
#define DEPTH_RENDER_TARGET 2
#define OPTICAL_DEPTH_RENDER_TARGET 3
#define NOISE3D_RENDER_TARGET 4

// Noise 3D
uniform float iDebugNoise3DZ = 0;

// Depth
uniform float iDebugMaxRayDistance = 0;
uniform bool iDebugMarkNotInAtmosphere = false;

bool debug_noises(
	in vec2 _ndc,
	in vec3 _camera_pos,
	in float _max_height,
	inout vec3 _color
) {
	if (iDebugRenderTarget == NOISE2D_RENDER_TARGET){
		float scale = 1 * pow(1.002,(_camera_pos.y+3000));
		vec2 noise_pos = _ndc * scale
			+ 10 * vec2(-_camera_pos.x, _camera_pos.z);
		_color = vec3(
			(terraind(noise_pos).x 
			/ _max_height + 1) * 0.5
		);
		return true;
	}
	if (iDebugRenderTarget == NOISE3D_RENDER_TARGET){
		float scale = 1 * pow(1.002,(_camera_pos.y+3000));
		vec2 noise_pos = _ndc * scale
			+ 10 * vec2(-_camera_pos.x, _camera_pos.z);
		_color = vec3(
			(terrain(vec3(noise_pos, iDebugNoise3DZ)) 
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
