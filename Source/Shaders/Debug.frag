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

// Sphere
uniform float iDebugRayStartDistance;
uniform float iDebugRayEndDistance;
uniform float iDebugRayOffset;

#include "Atmosphere.frag"
#include "Terrain.frag"
#include "Shading.frag"
#include "Raymarching.frag"
#include "Planet.frag"
#include "SphericalAtmosphere.frag"


bool debug_sphere(
	in vec2 _ndc,
	in vec3 _camera_pos,
	in vec3 _ray,
	in vec3 _sun_dir,
	out vec3 color_
){
	if (iDebugRenderTarget == SPHERE_RENDER_TARGET){
		color_ = vec3(0);

        // draw the atmosphere boundary
        float sin_theta = length(cross(_ray, normalize(_camera_pos)));
        float distance_to_atmosphere = length(_camera_pos) * sin_theta;
        if (distance_to_atmosphere < iAtmosphereMaxHeight
            && dot(_ray, -_camera_pos) > 0 // camera must face the planet
        ){
            color_ = vec3(0,0,0.4);
        }

        // draw a line
        vec3 a = normalize(cross(_camera_pos, _sun_dir)) * iDebugRayOffset * iPlanetRadius;
        // vec3 a = vec3(1,0,0) * iDebugRayOffset * iPlanetRadius;
        float line_distance = dot(_camera_pos - a, cross(_ray, _sun_dir));
        if (abs(line_distance) < 100){
            color_ = vec3(1,0,0);
        }

        // draw the planet
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

        // debug optical depth
        vec3 od_start = _camera_pos;
        vec3 od_end = od_start + (dist > 0 ? dist : 10 * iAtmosphereMaxHeight) * _ray;
        bool od_inside = ray_inside_spherical_atmosphere_i(od_start, od_end);
        if (od_inside){
            // color_ = vec3(distance(od_start, od_end)) / (2 * iAtmosphereMaxHeight);
            vec3 rayleigh = iRayleighStrength * 
                spherical_rayleigh(od_start, od_end, iRayleighSteps, _sun_dir);
			// float view_ray_od = spherical_optical_depth(od_start, od_end, iOpticalDepthSteps);
            // color_ = vec3(view_ray_od) / 1000;
            color_ = rayleigh;
			// blending with object color
			// color_ = color_ * exp(-view_ray_od * iRayleighFogFallOff * iRayleighFogStrength) 
				    // + rayleigh;
        }
        return true;

        vec3 start = -iPlanetRadius * iDebugRayStartDistance * _sun_dir + a;
        vec3 end = iPlanetRadius * iDebugRayEndDistance * _sun_dir + a;
        float dot_size = 0.9999;
        if (dot(_ray, normalize(start - _camera_pos)) > dot_size){
            color_ += vec3(0,1,0);
        }
        if (dot(_ray, normalize(end - _camera_pos)) > dot_size){
            color_ += vec3(0,1,0);
        }
        bool inside = ray_inside_spherical_atmosphere_i(start, end);
        if (inside) {
            if (dot(_ray, normalize(start - _camera_pos)) > dot_size){
                color_ += vec3(1,0,0);
            }
            if (dot(_ray, normalize(end - _camera_pos)) > dot_size){
                color_ += vec3(1,0,0);
            }
        }

		return true;
	}
	else if (iDebugRenderTarget == CIRCLE_RENDER_TARGET){
		color_ = vec3(0);
		float scale = 1 * pow(1.002,(_camera_pos.y+3000));
		vec2 pos = _ndc * scale
			+ 10 * vec2(-_camera_pos.x, _camera_pos.z);
        
        // draw the atmosphere 
        float distance_to_atmosphere = length(pos) - iAtmosphereMaxHeight;
        if (distance_to_atmosphere < 0){
            float density = spherical_atmosphere_density(vec3(pos, 0));
            color_ = mix(vec3(0,0,0.2), vec3(0,0,1), density);
        }
        if (abs(distance_to_atmosphere) < 0.005 * scale){
            color_ = vec3(1,0,0);
        }

        // draw a line
        vec3 line_direction = _sun_dir - dot(_sun_dir, iCameraFwd) * iCameraFwd;
        vec3 line_offset_direction = cross(iCameraFwd, line_direction);
        vec3 line_start = line_offset_direction * iDebugRayOffset * iPlanetRadius * 0.1;
        vec3 distance_to_line = cross(vec3(pos, 0) - line_start, line_direction);
        if (abs(distance_to_line.z) < 0.005 * scale){
            color_ = vec3(1,0,0);
        }

        // draw planet
        float distance_to_planet = planet_circle_sdf(pos, iPlanetRadius);
		if (abs(distance_to_planet) < 0.007 * scale){
			vec3 heightd = biplanar_mapping(normalize(pos) * iPlanetRadius);
			vec2 normal = heightd.yz;

			float diffuse = max(dot(vec3(normal.x, 0, normal.y), _sun_dir), 0);
			color_ = vec3(diffuse);
			//color_ = vec3(normal, 1);
		} else if (distance_to_planet < 0){
            color_ = vec3(0,0,0);
        }

        vec3 start = -iPlanetRadius * iDebugRayStartDistance * 0.1 * line_direction + line_start;
        vec3 end = iPlanetRadius * iDebugRayEndDistance * 0.1 * line_direction + line_start;
        float dot_size = 0.05 * scale;
        vec3 pos_3D = vec3(pos,0);
        if (distance(start, pos_3D) < dot_size){
            color_ += vec3(0,1,0);
        }
        if (distance(end, pos_3D) < dot_size){
            color_ += vec3(0,1,0);
        }
        bool inside = ray_inside_spherical_atmosphere_i(start, end);
        if (inside) {
            if (distance(start, pos_3D) < dot_size){
                color_ += vec3(1,0,0);
            }
            if (distance(end, pos_3D) < dot_size){
                color_ += vec3(1,0,0);
            }
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
        // x axis
		if (abs(y) < iDebugLineHeight * scale) {
			_color = vec3(0.5,0,0);
		}
        // terrain shape
		if (abs(y - height) < iDebugLineHeight * scale){
			_color = vec3(1);
		}else if (y > height && y < iWaterLevel){
            _color = vec3(0,0,1);
        }else if (y > height && y < iAtmosphereMaxHeight){
            float density = atmosphere_density(y);
            _color = mix(vec3(0.2), vec3(1), density);
        }

        // 
        if (abs(y - iAtmosphereMaxHeight) < iDebugLineHeight * scale){
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
