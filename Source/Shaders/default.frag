#version 330 core

out vec4 FragColor;

in vec3 color; // the input variable from the vertex shader (same name and same type)
in vec2 texCoord;
in vec3 normal;
in vec3 pos; // world pos of the frag

uniform sampler2D tex0; // texture from texture unit 0
uniform sampler2D tex1; // texture from texture unit 1, specular map
uniform vec4 lightColor;
uniform vec3 lightPos;
uniform vec3 camPos;

float baseIntensity = 2.0f;

vec4 pointLight()
{
	// intensity is inversely proportional to the square of the distance
	float dist = distance(lightPos, pos);
	float a = 3.0;
	float b = 0.7;
	float inten = baseIntensity / (a * dist * dist + b * dist + 1.0);

	float ambient = 0.2f;
	// diffuse
	vec3 n = normalize(normal);
	vec3 posToLight = normalize(lightPos - pos);
	float diffuse = max(dot(posToLight, n), 0.0f);

	// specular
	float specularAmount = 0.5f;
	vec3 posToCam = normalize(camPos - pos);
	vec3 reflectPosToLight = reflect(-posToLight, n);
	float specular = pow(max(dot(reflectPosToLight, posToCam), 0.0f),12) * specularAmount; 

	return (texture(tex0, texCoord) * (ambient + diffuse * inten) 
		+ specular * inten * texture(tex1,texCoord).r) * lightColor;
}

vec4 directionalLight()
{
	// light direction is a constant (not affected by the position of the frag)
	// and there is no light pos
	vec3 posToLight = normalize(vec3(1.0,1.0,0.0));

	float ambient = 0.2f;
	// diffuse
	vec3 n = normalize(normal);
	float diffuse = max(dot(posToLight, n), 0.0f);

	// specular
	float specularAmount = 0.5f;
	vec3 posToCam = normalize(camPos - pos);
	vec3 reflectPosToLight = reflect(-posToLight, n);
	float specular = pow(max(dot(reflectPosToLight, posToCam), 0.0f),12) * specularAmount; 

	return (texture(tex0, texCoord) * (ambient + diffuse) 
		+ specular * texture(tex1,texCoord).r) * lightColor;
}

vec4 spotLight()
{
	// cosines of the angles
	float outer = 0.90;
	float inner = 0.95;
	vec3 coneDir = normalize(vec3(0.0,-1.0,0.0));

	float ambient = 0.2f;
	// diffuse
	vec3 n = normalize(normal);
	vec3 posToLight = normalize(lightPos - pos);
	float diffuse = max(dot(posToLight, n), 0.0f);

	// specular
	float specularAmount = 0.5f;
	vec3 posToCam = normalize(camPos - pos);
	vec3 reflectPosToLight = reflect(-posToLight, n);
	float specular = pow(max(dot(reflectPosToLight, posToCam), 0.0f),12) * specularAmount; 

	// intensity is 1 inside inner, 0 outside outer, cosine in between
	float angle = dot(-posToLight, normalize(coneDir));
	float inten = clamp((angle - outer)/(inner - outer),0.0f,1.0f);

	return (texture(tex0, texCoord) * (ambient + diffuse * inten) 
		+ specular * inten * texture(tex1,texCoord).r) * lightColor;
}

void main()
{
	FragColor = vec4(0.0f);
}
