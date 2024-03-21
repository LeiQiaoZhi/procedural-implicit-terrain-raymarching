// global variables
int   gTerrainRaymarchSteps = 0;
int   gTerrainShadowSteps   = 0;
int   gCloudRaymarchSteps   = 0;
int   gTreeRaymarchSteps    = 0;
float gLastStepSize         = 0;

#define PROFILING_ENABLED 1

// Profiling macro
#if PROFILING_ENABLED
#define PROFILE(count) (count)++
#else
#define PROFILE(count) // No operation when profiling is disabled
#endif

#define PROFILE_TERRAIN_RAYMARCH_STEPS()  PROFILE(gTerrainRaymarchSteps)
#define PROFILE_TERRAIN_SHADOW_STEPS()    PROFILE(gTerrainShadowSteps)
#define PROFILE_CLOUD_RAYMARCH_STEPS()    PROFILE(gCloudRaymarchSteps)
#define PROFILE_TREE_RAYMARCH_STEPS()     PROFILE(gTreeRaymarchSteps)
#define PROFILE_LAST_STEP_SIZE(step_size) (gLastStepSize = step_size);
