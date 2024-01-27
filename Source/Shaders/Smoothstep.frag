// return (f(x), f'(x))
vec2 smoothstep_d(
    in float _x,
    in float _a = 0.0,
    in float _b = 1.0
){
    float t = clamp((_x - _a) / (_b - _a), 0.0, 1.0);
    return vec2(
        t*t*t*(t*(t*6.0-15.0)+10.0),
        30.0*t*t*(t*(t-2.0)+1.0)
    );
    return vec2(
         t * t * (3.0 - 2.0 * t),
         6.0 * t * (1.0 - t) / (_b - _a)
    );
}

vec4 smoothstep_d(
    in vec2 _x,
    in float _a = 0.0,
    in float _b = 1.0
){
    vec2 t = clamp((_x - _a) / (_b - _a), 0.0, 1.0);
    return vec4(
        t*t*t*(t*(t*6.0-15.0)+10.0),
        30.0*t*t*(t*(t-2.0)+1.0)
    );
}

float my_smoothstep(
    in float _x,
    in float _a = 0.0,
    in float _b = 1.0
){
    float t = clamp((_x - _a) / (_b - _a), 0.0, 1.0);
    return t*t*t*(t*(t*6.0-15.0)+10.0);
}

vec2 my_smoothstep(
    in vec2 _x,
    in float _a = 0.0,
    in float _b = 1.0
){
    vec2 t = clamp((_x - _a) / (_b - _a), 0.0, 1.0);
    return t*t*t*(t*(t*6.0-15.0)+10.0);
}
