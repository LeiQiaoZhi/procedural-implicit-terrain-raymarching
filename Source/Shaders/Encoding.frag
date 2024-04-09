uint rgb_to_uint(
    in vec3 _rgb
) {
    return 
         uint(_rgb.r * 255.0)  << 16 |
         uint(_rgb.g * 255.0)  << 8  |
         uint(_rgb.b * 255.0);
}


vec3 uint_to_rgb(uint _value) {
    float r = float(uint((_value >> 16) & uint(0xFF))) / 255.0;
    float g = float(uint((_value >> 8) & uint(0xFF))) / 255.0;
    float b = float(uint(_value & uint(0xFF))) / 255.0;
    return vec3(r, g, b);
}


vec4 float_to_vec4(float _value) {
    uint ivalue = floatBitsToUint(_value); // Convert float to uint

    uint b0 = (ivalue & uint(0x000000FF)) >>  0; // Extract first 8 bits
    uint b1 = (ivalue & uint(0x0000FF00)) >>  8; // Extract second 8 bits
    uint b2 = (ivalue & uint(0x00FF0000)) >> 16; // Extract third 8 bits
    uint b3 = (ivalue & uint(0xFF000000)) >> 24; // Extract fourth 8 bits

    // Convert each byte to a normalized float value and return as vec4
    return vec4(
            float(b0) / 255.0,
            float(b1) / 255.0,
            float(b2) / 255.0,
            float(b3) / 255.0
        );
}


float vec4_to_float(vec4 _value) {
    uint b0 = uint(_value.r * 255.0);
    uint b1 = uint(_value.g * 255.0);
    uint b2 = uint(_value.b * 255.0);
    uint b3 = uint(_value.a * 255.0);

    uint ivalue = b0 | (b1 << 8) | (b2 << 16) | (b3 << 24);

    return uintBitsToFloat(ivalue);
}
