#version 330 core

out vec4 FragColor;

uniform vec2 iResolution;

void main() {
    FragColor = vec4(
        gl_FragCoord.x / iResolution.x,
        gl_FragCoord.y / iResolution.y,
        1.0, 1.0); 
}
