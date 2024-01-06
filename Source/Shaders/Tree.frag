#include "Terrain.frag"

uniform bool iTreeEnabled;
// sdf
uniform float iTreeDomainSize;
uniform float iTreeRadius;
uniform float iTreeHeight;
uniform float iTreeOffset;
uniform float iTreeRandomness;
uniform vec2 iTreeSizeRandomness;
uniform float iTreeSteepnessThreshold;
// normal
uniform float iTreeNormalEpsilon;
// rendering
uniform int iTreeSteps;
uniform int iTreeShadowSteps;
uniform float iTreeShadowThreshold;
uniform float iTreeShadowLower;
uniform vec3 iTreeColor;
uniform float iTreeNormalTerrainProportion;
// fbm
uniform float iTreeFbmStrength;


// with domain repetition
float tree_sdf(
    in vec3 _pos
){
	vec3 m = floor(_pos / iTreeDomainSize); // coord of domain
    float d = 1e10;

    // check every neighbouring domain
    vec2 signs = vec2(1.0, 1.0);

    // check neighbouring domains
    for (int i = -1; i <= 1; i++){
		for(int j = -1; j <= 1; j++){
	        vec3 center = (m + 0.5) * iTreeDomainSize; // center of domain in world space
            center.xz += signs * vec2(i,j) * iTreeDomainSize;
            vec2 randomOffset =  hash2(m.xz + signs * vec2(i,j)) - 0.5; // range [-0.5, 0.5]
            center += iTreeRandomness * vec3(randomOffset.x, 0.0, randomOffset.y) * iTreeDomainSize;
            vec4 heightd = terrain_fbm_d(center.xz);
            center.y = heightd.x;

            vec3 normal = heightd.yzw;
            if (normal.y < iTreeSteepnessThreshold) continue; // don't place trees on steep slopes

            vec2 randomSizeOffset =  iTreeSizeRandomness * (hash2(m.xz + signs * vec2(i,j) + vec2(20.01,10.29)) - 0.5); 
            vec3 r = vec3(iTreeRadius + randomSizeOffset.x, 
                        iTreeHeight + randomSizeOffset.y, 
                        iTreeRadius + randomSizeOffset.x);
            // local position
            vec3 w = _pos - center - vec3(0.0, iTreeOffset, 0.0);

            // sdf of ellipsoid
            float wr = length(w/r);
            d = min(d, wr * (wr - 1.0) / length(w / (r * r)));
        }
	}

    // distort with 3d noise
    float noise = cloud_fbm_d(_pos).x;
    d += iTreeFbmStrength * noise * noise * 0.001;

    return d;
}

vec3 treeNormal(in vec3 pos){
    vec2 e = vec2(1, -1) * 0.5773;
    return normalize(e.xyy * tree_sdf(pos + e.xyy * iTreeNormalEpsilon * 0.0001) + 
  					e.yyx * tree_sdf(pos + e.yyx * iTreeNormalEpsilon * 0.0001) +
					e.yxy * tree_sdf(pos + e.yxy * iTreeNormalEpsilon * 0.0001) + 
					e.xxx * tree_sdf(pos + e.xxx * iTreeNormalEpsilon * 0.0001));
}

float treeShadow(in vec3 pos, in vec3 pointToSun){
	// shadow ray
	float accumulative = 0;
	float rayDistance = 0;
	float threshold = iTreeShadowThreshold;
	for (float i = 0; i < iTreeShadowSteps; i++) 
	{
		vec3 shadowPos = pos + rayDistance * pointToSun;
		float d = tree_sdf(shadowPos);
		if (d < threshold){
			accumulative += (d - threshold) * rayDistance;
		}
		rayDistance += 3;
	}

	float shadow = smoothstep(iTreeShadowLower, 0, accumulative);
	return shadow;
}
