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
uniform int iSunDiskDotPower;



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
