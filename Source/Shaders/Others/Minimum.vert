#version 330 core

layout(location = 0) in vec2 aPos;  // Vertex position
layout(location = 1) in vec2 aTexCoords;  // Texture position

out vec2 iIncrementalTexCoord;  

void main() {
    gl_Position = vec4(aPos, 0.0, 1.0);
    iIncrementalTexCoord = aTexCoords;
}

