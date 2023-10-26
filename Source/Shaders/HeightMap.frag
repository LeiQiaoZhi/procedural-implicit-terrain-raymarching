#version 330 core

#include "ValueNoise.frag"

out vec4 FragColor;

uniform float iTime;
uniform vec2 iResolution;

void main() 
{
    const float scale = 0.005;
    vec2 offset = vec2(1.0,1.0) * iTime;
    FragColor = vec4(vec3(
        noise(
            gl_FragCoord.x * scale + offset.x,
            gl_FragCoord.y * scale + offset.y
            )),1.0); 
}
