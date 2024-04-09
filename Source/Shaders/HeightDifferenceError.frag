uniform bool iStartHDE = false;

#include "Encoding.frag"


bool render_height_diffrence_error(
    in    float _t, // distance to compare to
    in    vec3  _camera_pos,
    in    vec3  _ray,
    inout vec4  color_
){
    if (!iStartHDE) {
        return false;
    }

    if (_t < 0.0) {
        // no intersection, not applicable
        color_ = float_to_vec4(-1); return true;
    }

    vec3 pos = _camera_pos + _t * _ray;
    vec3 height = terrain_fbm(pos.xz);
    float hde = abs(pos.y - height.y);

    color_ = float_to_vec4(hde);

    return true;
}