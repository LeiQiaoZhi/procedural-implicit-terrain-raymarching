#include "Constants.frag"

// return (f(x), f'(x))
vec2 smoothstepd(in float x, in float a = 0.0, in float b = 1.0){
    float t = (x - a) / (b - a);
    if (x < a){
        return vec2(0, 0);
    }
    if (x > b){
        return vec2(1, 0);
    }
    return vec2(
        t*t*t*(t*(t*6.0-15.0)+10.0),
        30.0*t*t*(t*(t-2.0)+1.0)
    );
    return vec2(
         t * t * (3.0 - 2.0 * t),
         6.0 * t * (1.0 - t) / (b - a)
    );
}

// range [0, 1]
float hash(in vec2 p) {
    float h = dot(p, vec2(127.1, 311.7));
    return fract(sin(h) * 43758.5453);
}

float hash(in float n)
{
    return fract( n*17.0*fract( n*0.3183099 ));
}

// range [0, 1]
vec2 hash2(in vec2 p){
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453123);
}

// return (Noise(p), dx, dz)
// Noise(p) between -1 and 1
vec3 noised(in vec2 p){
    vec2 ij = floor(p);
    vec2 xz = fract(p);

    vec2 s1 = smoothstepd(xz.x);
    float sx = s1.x;
    float dsx = s1.y;
    vec2 s2 = smoothstepd(xz.y);
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
float noise3D(in vec3 p){
    vec3 ijk = floor(p);
    vec3 xyz = fract(p);

    vec2 s1 = smoothstepd(xyz.x);
    float sx = s1.x;
    vec2 s2 = smoothstepd(xyz.y);
    float sy = s2.x;
    vec2 s3 = smoothstepd(xyz.z);
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
