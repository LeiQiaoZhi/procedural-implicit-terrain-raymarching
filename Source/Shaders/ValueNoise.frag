const float PI = 3.1415926535897932384626433832795;

// Pseudorandom hash function
float hash(int i, int j) {
    float u = fract(sin(float(i) * 12.9898 + float(j) * 78.233) * 43758.5453);
    return u;
}

float a(int i, int j)
{
    float u = 50 * fract(i / PI);
    float v = 52 * fract(j / PI);
//	return  fract(u*v*(u+v)) ;
    return hash(i,j);
}

float differentiate_smoothstep(float x, float a = 0.0, float b = 1.0)
{
    float t = smoothstep(a, b, x);
    return 6.0 * t * (1.0 - t) / (b - a);
}

// piecewise function, i,j are the coordinates of the piece
// x,y are the global coordinates of the noise, y is returned
// return (height, normal)
vec4 noise_piece(float x,float z, int i, int j)
{
    float a00 = a(i,j);
    float a01 = a(i,j+1);
    float a10 = a(i+1,j);
    float a11 = a(i+1,j+1);
    float height = a00 + (a10 - a00) * smoothstep(0.0, 1.0, x - i)
		+ (a01 - a00) * smoothstep(0.0, 1.0, z - j) +
        (a11 + a00 - a01 - a10) * smoothstep(0.0, 1.0, x - i) * smoothstep(0.0, 1.0, z - j);

    float height_wrtx = (a10 - a00) * differentiate_smoothstep(x - i) 
        + (a11 + a00 - a01 - a10) * differentiate_smoothstep(x - i) * smoothstep(0.0, 1.0, z - j);
    float height_wrtz = (a01 - a00) * differentiate_smoothstep(z - j) 
		+ (a11 + a00 - a01 - a10) * smoothstep(0.0, 1.0, x - i) * differentiate_smoothstep(z - j);
    vec3 normal = normalize(vec3(-height_wrtx, 1.0, -height_wrtz));

    return vec4(height, normal);
}

// value noise
// return (height, normal)
vec4 noise(float x, float z){
    int i = int(floor(x));
	int j = int(floor(z));
	return noise_piece(x,z,i,j);
}
