// global variables
int gTerrainRaymarchSteps = 0;
int gTerrainShadowSteps = 0;

#define PROFILING_ENABLED 1

// Profiling macro
#if PROFILING_ENABLED
#define PROFILE(count) (count)++
#else
#define PROFILE(count) // No operation when profiling is disabled
#endif

#define PROFILE_TERRAIN_RAYMARCH_STEPS() PROFILE(gTerrainRaymarchSteps)
#define PROFILE_TERRAIN_SHADOW_STEPS()   PROFILE(gTerrainShadowSteps)