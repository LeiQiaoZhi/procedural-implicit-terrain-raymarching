// sun position
uniform bool iCameraAsCenter;
uniform vec3 iSunCenter;

uniform float iSunTheta;
uniform float iSunPhi;
uniform float iSunRadius;

// sun disk
uniform bool iEnableSunDisk;
uniform float iSunDiskThreshold;
uniform vec3 iSunDiskColor;
uniform int iSunDisk1DotPower;
uniform float iSunDisk1Strength;
uniform int iSunDisk2DotPower;
uniform float iSunDisk2Strength;



vec3 get_sun_pos(
	in vec3 _camera_pos
) {
	vec3 center = iCameraAsCenter ? _camera_pos : iSunCenter;
	return center + iSunRadius * vec3(
		sin(iSunTheta) * cos(iSunPhi),
		cos(iSunTheta),
		sin(iSunTheta) * sin(iSunPhi)
	);
}



// use for approximation -- since the sun is so far away
vec3 get_sun_dir(
	in vec3 _camera_pos
) {
	return normalize(get_sun_pos(_camera_pos) - _camera_pos);
}



vec3 sun_disk(
	in vec3 _sun_dir,
	in vec3 _camera_pos,
	in vec3 _view_ray
){
	if (iEnableSunDisk){
		float sun_dot = dot(_view_ray, _sun_dir);
		if (100 * sun_dot > iSunDiskThreshold){
			return iSunDiskColor *
				(pow(max(0, sun_dot), iSunDisk1DotPower) * iSunDisk1Strength +
				pow(max(0, sun_dot), iSunDisk2DotPower) * iSunDisk2Strength);
		}
	}
	return vec3(0.0);
}
