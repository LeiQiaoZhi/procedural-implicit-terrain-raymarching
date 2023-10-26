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

// piecewise function, i,j are the coordinates of the piece
// x,y are the global coordinates of the noise, y is returned
float noise_piece(float x,float z, int i, int j)
{
    return a(i,j) + (a(i+1,j) - a(i,j)) * smoothstep(0.0, 1.0, x - i)
        + (a(i,j+1) - a(i,j)) * smoothstep(0.0, 1.0, z - j)
		+ (a(i+1,j+1) + a(i,j) - a(i+1,j) - a(i,j+1)) * smoothstep(0.0, 1.0, x - i) * smoothstep(0.0, 1.0, z - j);
}

// value noise
float noise(float x, float z){
    int i = int(floor(x));
	int j = int(floor(z));
	return noise_piece(x,z,i,j);
}
