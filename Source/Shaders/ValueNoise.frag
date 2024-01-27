#include "Constants.frag"
#include "Hash.frag"
#include "Smoothstep.frag"


float noise(
    in vec2 _p,
	in bool _range01 = false
){
    vec2 ij = floor(_p);
    vec2 xz = fract(_p);

    vec2 sxz = my_smoothstep(xz);
    float sx = sxz.x;
    float sz = sxz.y;

    float id = ij.x + ij.y * 157.0;
    float a = hash1(id);
    float b = hash1(id + 1.0);
    float c = hash1(id + 157.0);
    float d = hash1(id + 158.0);

    float ba = b - a;
    float ca = c - a;
    float abcd = a + d - c - b;

    float height = a + ba * sx + ca * sz + abcd * sx * sz;

    if (_range01) 
		return height;
    return 2 * height - 1;
}


// return (Noise(p), dN/dx, dN/dz)
// Noise(p) between -1 and 1
vec3 noise_d(
    in vec2 _p,
	in bool _range01 = false
){
    vec2 ij = floor(_p);
    vec2 xz = fract(_p);

    vec4 sxyd = smoothstep_d(xz);
    float sx = sxyd.x;
    float sz = sxyd.y;
    float dsx = sxyd.z;
	float dsz = sxyd.w;

    float id = ij.x + ij.y * 157.0;
    float a = hash1(id);
    float b = hash1(id + 1.0);
    float c = hash1(id + 157.0);
    float d = hash1(id + 158.0);

    float ba = b - a;
    float ca = c - a;
    float abcd = a + d - c - b;

    float height = a + ba * sx + ca * sz + abcd * sx * sz;
    float dx = ba * dsx + abcd * dsx * sz;
    float dy = ca * dsz + abcd * sx * dsz;

    if (_range01)
        return vec3(height, dx, dy);
    return vec3(2 * height - 1, 2 * dx, 2 * dy);
}


// return (Noise(p), dx, dz)
// Noise(p) between -1 and 1
float noise_3D(
    in vec3 _p,
	in bool _range01 = false
){
    vec3 ijk = floor(_p);
    vec3 xyz = fract(_p);

    vec2 s1 = smoothstep_d(xyz.x);
    float sx = s1.x;
    vec2 s2 = smoothstep_d(xyz.y);
    float sy = s2.x;
    vec2 s3 = smoothstep_d(xyz.z);
    float sz = s3.x;

    float id = ijk.x + ijk.y * 157.0 + 113.0 * ijk.z;
    float a = hash1(id + 0.0);
    float b = hash1(id + 1.0);
    float c = hash1(id + 157.0);
    float d = hash1(id + 158.0);
    float e = hash1(id + 113.0);
    float f = hash1(id + 114.0);
    float g = hash1(id + 270.0);
    float h = hash1(id + 271.0);

    float height = 
        a 
        + (b - a) * sx 
        + (c - a) * sy 
        + (e - a) * sz 
        + (a - b - c + d) * sx * sy 
        + (a - c - e + g) * sy * sz 
        + (a - b - e + f) * sx * sz 
        + (-a + b + c - d + e - f - g + h) * sx * sy * sz;

    if (_range01)
		return height;
    return 2 * height - 1;
}



vec4 noise_3D_d(
    in vec3 _p,
	in bool _range01 = false
){
    vec3 ijk = floor(_p);
    vec3 xyz = fract(_p);

    vec2 s1 = smoothstep_d(xyz.x);
    float sx = s1.x;
    float dsx = s1.y;
    vec2 s2 = smoothstep_d(xyz.y);
    float sy = s2.x;
    float dsy = s2.y;
    vec2 s3 = smoothstep_d(xyz.z);
    float sz = s3.x;
    float dsz = s3.y;

    float id = ijk.x + ijk.y * 157.0 + 113.0 * ijk.z;
    float a = hash1(id + 0.0);
    float b = hash1(id + 1.0);
    float c = hash1(id + 157.0);
    float d = hash1(id + 158.0);
    float e = hash1(id + 113.0);
    float f = hash1(id + 114.0);
    float g = hash1(id + 270.0);
    float h = hash1(id + 271.0);

    float ba = b - a;
    float ca = c - a;
    float ea = e - a;
    float abcd = a - b - c + d;
    float aceg = a - c - e + g;
    float abef = a - b - e + f;
    float abcdefgh = -a + b + c - d + e - f - g + h;

    float height = 
        a 
        + ba * sx + ca * sy + ea * sz
        + abcd * sx * sy 
        + aceg * sy * sz 
        + abef * sx * sz 
        + abcdefgh * sx * sy * sz;
    float dx = 
	    ba * dsx 
		+ abcd * dsx * sy 
        + abef * dsx * sz 
		+ abcdefgh * dsx * sy * sz;
    float dy =
        ca * dsy
        + abcd * sx * dsy
        + aceg * dsy * sz
        + abcdefgh * sx * dsy * sz;
    float dz =
		ea * dsz
		+ aceg * sy * dsz
		+ abef * sx * dsz
		+ abcdefgh * sx * sy * dsz;

    if (_range01)
		return vec4(height, dx, dy, dz);
    return vec4(2 * height - 1, 2 * dx, 2 * dy, 2 * dz);
}
