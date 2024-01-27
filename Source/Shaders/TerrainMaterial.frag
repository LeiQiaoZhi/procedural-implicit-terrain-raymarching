// material parameters
uniform vec3 iSandColor;
uniform int iSandUpperFadeLength;
uniform vec3 iDirtColor;
uniform float iDirtThreshold;
// grass
uniform vec3 iGrassColor;
uniform vec3 iGrassColor2;
uniform float iGrassThreshold;
uniform int iGrassMaxHeight;
uniform int iGrassMinHeight;
uniform int iGrassUpperFadeLength;
uniform int iGrassLowerFadeLength;
// grass color fbm
uniform float iGrassColorHorizontalScale;
uniform int iGrassColorNumLayers;
uniform float iGrassColorHorizontalShrink;
uniform float iGrassColorVerticalShrink;
// grass edge fbm
uniform float iGrassEdgeFbmStrength;
uniform float iGrassEdgeHorizontalScale;
uniform int iGrassEdgeNumLayers;
uniform float iGrassEdgeHorizontalShrink;
uniform float iGrassEdgeVerticalShrink;


// returns [0,1]
float grass_color_fbm(in vec2 _pos){
	float result = fbm(
		_pos / iGrassColorHorizontalScale, 
		iGrassColorNumLayers,
		iGrassColorHorizontalShrink,
		0.5,
		iGrassColorVerticalShrink,
		vec2(1,1),
		true
	);
	return result;
}


// for blending with the lower part (beaches)
float grass_edge_fbm(in vec2 _pos){
	float result = fbm(
		_pos / iGrassEdgeHorizontalScale, 
		iGrassEdgeNumLayers,
		iGrassEdgeHorizontalShrink,
		0.5,
		iGrassEdgeVerticalShrink,
		vec2(1,1),
		true
	);
	return result;
}
