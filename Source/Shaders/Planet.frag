#include "Terrain.frag"
#include "Raymarching.frag"

// Sphere
uniform float iDebugSphereRadius = 100;
uniform int iDebugTriplanarMappingSharpness = 1;

float planet_sdf(
    in vec3 _pos,
    in float _radius
) {
    vec3 pos = normalize(_pos) * _radius;
    vec3 normal = normalize(pos);

    vec2 xuv = pos.zy + sign(pos.x) * vec2(10000, 29000);
    vec2 yuv = pos.xz + sign(pos.y) * vec2(10000, 29000) * 2;
    vec2 zuv = pos.xy + sign(pos.z) * vec2(10000, 29000) * 3;
    float xheight = terrain_fbm(xuv);
    float yheight = terrain_fbm(yuv);
    float zheight = terrain_fbm(zuv);

    vec3 heights = vec3(xheight, yheight, zheight);
    vec3 weights = pow(abs(normal), vec3(iDebugTriplanarMappingSharpness));
    weights = weights / (weights.x + weights.y + weights.z);

    float height = dot(heights, weights);
    return length(_pos) - _radius - height;
}

float raymarch_sphere(
    in vec3 pos,
    in vec3 ray
) {
    vec3 origin = pos;
    float clipNear = 0.1;
    float lastHeight;
    float lastY;

    float t = clipNear;
    float step_size = iStepSize;
    for (int i = 0; i < iMaxSteps; i++)
    {
        pos = origin + t * ray;

        float dist_to_outer = sphere_sdf(pos, iDebugSphereRadius + iMaxHeight + iGlobalMaxHeight);
        if (dist_to_outer < 0) {
            float height = planet_sdf(pos, iDebugSphereRadius);

            // check for terrain intersection
            if (height < 0) ;
            {
                // interpolation
                t -= step_size * height / (height - lastHeight);
                return t;
            }

            lastHeight = height;
        }
        step_size = max(iStepSize, dist_to_outer);
        t += step_size;

        if (t > iMaxDistance) break;
    }
    return -1;
}

// returns (height, normal)
vec4 triplanar_mapping(
    in vec3 _pos
) {
    // the normal of the original sphere
    vec3 normal = normalize(_pos);
    // uv of 3 planes
    vec2 xuv = _pos.zy + sign(_pos.x) * vec2(10000, 29000);
    vec2 yuv = _pos.xz + sign(_pos.y) * vec2(10000, 29000) * 2;
    vec2 zuv = _pos.xy + sign(_pos.z) * vec2(10000, 29000) * 3;

    // sample height and normal from fbm
    vec4 xfbm = terrain_fbm_d(xuv);
    float xheight = xfbm.x;
    vec2 xpartial = -xfbm.yw; // dz, dy
    vec3 xnormal = xfbm.yzw;
    vec4 yfbm = terrain_fbm_d(yuv);
    float yheight = yfbm.x;
    vec2 ypartial = -yfbm.yw; // dx, dz
    vec3 ynormal = yfbm.yzw;
    vec4 zfbm = terrain_fbm_d(zuv);
    float zheight = zfbm.x;
    vec2 zpartial = -zfbm.yw; // dx, dy
    vec3 znormal = zfbm.yzw;

    vec3 axis_sign = sign(normal);
    xnormal.y *= axis_sign.x;
    ynormal.y *= axis_sign.y;
    znormal.y *= axis_sign.z;

    vec3 heights = vec3(xheight, yheight, zheight);
    heights = (heights / (iMaxHeight + iGlobalMaxHeight) + 1) * 0.5;
    vec3 weights = pow(abs(normal), vec3(iDebugTriplanarMappingSharpness));
    weights = weights / (weights.x + weights.y + weights.z);

    float height = dot(heights, weights);

    // basic swizzle
    vec3 normal_world = normalize(
            xnormal.yzx * weights.x +
                ynormal.xyz * weights.y +
                znormal.xzy * weights.z
        );

    vec2 duv = xpartial * weights.x + ypartial * weights.y + zpartial * weights.z;
    vec3 normal_ts = vec3(-duv.x, 1, -duv.y); // (u, n, v)

    return vec4(height, normal_world);
}

float planet_circle_sdf(
    in vec2 _pos,
    in float _radius
) {
    // the normal of the original sphere
    vec2 pos_on_circle = normalize(_pos) * _radius;
    vec2 normal = normalize(_pos);
    // uv of 3 planes
    float x = pos_on_circle.y + sign(pos_on_circle.x) * 10000;
    float y = pos_on_circle.x + sign(pos_on_circle.y) * 10000 * 2;

    // sample height and normal from fbm
    float xheight = terrain_fbm(vec2(x, 0));
    float yheight = terrain_fbm(vec2(y, 0));

    vec2 heights = vec2(xheight, yheight);
    vec2 weights = pow(abs(normal), vec2(iDebugTriplanarMappingSharpness));
    weights = weights / (weights.x + weights.y);

    float height = dot(heights, weights);
    return length(_pos) - _radius - height;
}

// returns (height, normal), for circles
vec3 biplanar_mapping(
    in vec2 _pos
) {
    // the normal of the original sphere
    vec2 normal = normalize(_pos);
    // uv of 3 planes
    float x = _pos.y + sign(_pos.x) * 10000;
    float y = _pos.x + sign(_pos.y) * 10000 * 2;

    // sample height and normal from fbm
    vec4 xfbm = terrain_fbm_d(vec2(x, 0));
    float xheight = xfbm.x;
    float xpartial = xfbm.y * sign(_pos.x);
    vec4 yfbm = terrain_fbm_d(vec2(y, 0));
    float yheight = yfbm.x;
    float ypartial = -yfbm.y * sign(_pos.y);

    vec2 heights = vec2(xheight, yheight);
    heights = (heights / (iMaxHeight + iGlobalMaxHeight) + 1) * 0.5;
    vec2 weights = pow(abs(normal), vec2(iDebugTriplanarMappingSharpness));
    weights = weights / (weights.x + weights.y);

    float height = dot(heights, weights);

    vec2 tangent = vec2(normal.y, -normal.x);
    float total_parital = dot(vec2(xpartial, ypartial), weights);

    return vec3(height, normalize(-total_parital * tangent + normal));
}
