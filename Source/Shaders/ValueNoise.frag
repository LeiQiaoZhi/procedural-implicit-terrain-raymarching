#include "Constants.frag"

// return (f(x), f'(x))
vec2 smoothstep_d(
    in float _x,
    in float _a = 0.0,
    in float _b = 1.0
){
    float t = (_x - _a) / (_b - _a);
    if (_x < _a){
        return vec2(0, 0);
    }
    if (_x > _b){
        return vec2(1, 0);
    }
    return vec2(
        t*t*t*(t*(t*6.0-15.0)+10.0),
        30.0*t*t*(t*(t-2.0)+1.0)
    );
    return vec2(
         t * t * (3.0 - 2.0 * t),
         6.0 * t * (1.0 - t) / (_b - _a)
    );
}

// range [0, 1]
float hash(in vec2 _p) {
    float h = dot(_p, vec2(127.1, 311.7));
    return fract(sin(h) * 43758.5453);
}

float hash(in float _p)
{
    return fract(_p*17.0*fract(_p*0.3183099));
}

// range [0, 1]
vec2 hash2(in vec2 _p){
    _p = vec2(dot(_p, vec2(127.1, 311.7)), dot(_p, vec2(269.5, 183.3)));
    return fract(sin(_p) * 43758.5453123);
}


// return (Noise(p), dN/dx, dN/dz)
// Noise(p) between -1 and 1
vec3 noise_d(in vec2 _p){
    vec2 ij = floor(_p);
    vec2 xz = fract(_p);

    vec2 s1 = smoothstep_d(xz.x);
    float sx = s1.x;
    float dsx = s1.y;
    vec2 s2 = smoothstep_d(xz.y);
    float sz = s2.x;
    float dsz = s2.y;

    float a = hash(ij);
    float b = hash(ij + vec2(1, 0));
    float c = hash(ij + vec2(0, 1));
    float d = hash(ij + vec2(1, 1));

    float ba = b - a;
    float ca = c - a;
    float abcd = a + d - c - b;

    float height = a + ba * sx + ca * sz + abcd * sx * sz;
    float dx = ba * dsx + abcd * dsx * sz;
    float dy = ca * dsz + abcd * sx * dsz;

    return vec3(2 * height - 1, 2 * dx, 2 * dy);
}


// return (Noise(p), dx, dz)
// Noise(p) between -1 and 1
float noise_3D(in vec3 _p){
    vec3 ijk = floor(_p);
    vec3 xyz = fract(_p);

    vec2 s1 = smoothstep_d(xyz.x);
    float sx = s1.x;
    vec2 s2 = smoothstep_d(xyz.y);
    float sy = s2.x;
    vec2 s3 = smoothstep_d(xyz.z);
    float sz = s3.x;

    float id = ijk.x + ijk.y * 157.0 + 113.0 * ijk.z;
    float a = hash(id + 0.0);
    float b = hash(id + 1.0);
    float c = hash(id + 157.0);
    float d = hash(id + 158.0);
    float e = hash(id + 113.0);
    float f = hash(id + 114.0);
    float g = hash(id + 270.0);
    float h = hash(id + 271.0);

    float height = 
        a 
        + (b - a) * sx 
        + (c - a) * sy 
        + (e - a) * sz 
        + (a - b - c + d) * sx * sy 
        + (a - c - e + g) * sy * sz 
        + (a - b - e + f) * sx * sz 
        + (-a + b + c - d + e - f - g + h) * sx * sy * sz;

    return 2 * height - 1;
}



vec4 noise_3D_d(in vec3 _p){
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
    float a = hash(id + 0.0);
    float b = hash(id + 1.0);
    float c = hash(id + 157.0);
    float d = hash(id + 158.0);
    float e = hash(id + 113.0);
    float f = hash(id + 114.0);
    float g = hash(id + 270.0);
    float h = hash(id + 271.0);

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

    return vec4(2 * height - 1, 2 * dx, 2 * dy, 2 * dz);
}
