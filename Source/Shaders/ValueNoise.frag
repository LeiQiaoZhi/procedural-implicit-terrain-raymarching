const float PI = 3.1415926535897932384626433832795;

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

float hash(in vec2 p) {
    float h = dot(p, vec2(127.1, 311.7));
    return fract(sin(h) * 43758.5453);
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
