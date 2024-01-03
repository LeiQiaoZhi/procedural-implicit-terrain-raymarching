// sun position
uniform float iTheta;
uniform float iPhi;
uniform float iRadius;

// sun disk
uniform bool iEnableSunDisk;
uniform float iSunDiskThreshold;
uniform vec3 iSunDiskColor;
uniform int iSunDiskDotPower;

vec3 get_sun_pos() {
	return iRadius * vec3(
		sin(iTheta) * cos(iPhi),
		cos(iTheta),
		sin(iTheta) * sin(iPhi)
	);
}

vec3 sun_disk(
	in vec3 _sun_pos,
	in vec3 _camera_pos,
	in vec3 _view_ray
){
	if (iEnableSunDisk){
		vec3 sun_ray = normalize(_sun_pos - _camera_pos);
		float sun_dot = dot(_view_ray, sun_ray);
		if (100 * sun_dot > iSunDiskThreshold){
			return iSunDiskColor
					* pow(max(0, sun_dot), iSunDiskDotPower);
		}
	}
	return vec3(0.0);
}
