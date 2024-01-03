#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aColor;
layout (location = 2) in vec2 aTex; // TexCoords
layout (location = 3) in vec3 aNormal; // TexCoords

// outputs to fragment shader
out vec3 color;
out vec2 texCoord;
out vec3 normal;
out vec3 pos; // world pos of the frag

uniform float scale;
uniform mat4 world;
uniform mat4 view;
uniform mat4 proj;

void main()
{
	// Outputs the positions/coordinates of all vertices
	vec4 scaled_pos = vec4(aPos.x * scale, aPos.y * scale, aPos.z * scale, 1.0f);
	// transforms from model space to clip space
	gl_Position = proj * view * world * scaled_pos;

	// Assigns the colors from the Vertex Data to "color"
	color = aColor;
	texCoord = aTex;
	normal = aNormal;
	pos = vec3(world * scaled_pos);
}
