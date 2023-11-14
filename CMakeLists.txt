cmake_minimum_required(VERSION 3.12)
project(TerrainApp)

# Set the C++ standard to C++17 for all targets in this project
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

### Set up the source groups ###

# Collect all .cpp and .h files in the current directory
file(GLOB_RECURSE ALL_CPP "Source/*.cpp")
file(GLOB_RECURSE ALL_HEADERS "Source/*.h")
file(GLOB CPP_SOURCES "Source/*.cpp")
file(GLOB HEADER_FILES "Source/*.h")
file(GLOB_RECURSE CAMERA_CPP "Source/Camera/*.cpp")
file(GLOB_RECURSE CAMERA_HEADERS "Source/Camera/*.h")
file(GLOB_RECURSE UI_CPP "Source/UI/*.cpp")
file(GLOB UI_HEADERS "Source/UI/*.h")
file(GLOB_RECURSE PROP_HEADERS "Source/UI/Properties/*.h")
file(GLOB_RECURSE IMGUI "${CMAKE_SOURCE_DIR}/imgui/*")
file(GLOB_RECURSE GLAD "Source/glad.c")
file(GLOB_RECURSE GIT ".gitignore" "README.*")
file(GLOB_RECURSE SHADERS "Source/*.frag" "Source/*.vert")

# Set up filters for organizing the source files in the Visual Studio solution
source_group("Source Files" FILES ${CPP_SOURCES})
source_group("Header Files" FILES ${HEADER_FILES})
source_group("Source Files\\Camera" FILES ${CAMERA_CPP})
source_group("Header Files\\Camera" FILES ${CAMERA_HEADERS})
source_group("Source Files\\UI" FILES ${UI_CPP})
source_group("Header Files\\UI" FILES ${UI_HEADERS})
source_group("Header Files\\UI\\Properties" FILES ${PROP_HEADERS})
source_group("Shader Files" FILES ${SHADERS})
source_group("External\\Imgui" FILES ${IMGUI})
source_group("External\\Glad" FILES ${GLAD})
source_group("External\\Git" FILES ${GIT})

add_executable(TerrainApp ${ALL_CPP} ${ALL_HEADERS} ${IMGUI} ${GLAD} ${GIT} ${SHADERS})
# don't compile shaders and gitignore files
set_source_files_properties(${GIT} ${SHADERS} PROPERTIES HEADER_FILE_ONLY TRUE)

### Set up the include directories and link libraries ###

# Set the additional include directories
target_include_directories(TerrainApp PRIVATE
    "${CMAKE_SOURCE_DIR}/Libraries/include"
    "${CMAKE_SOURCE_DIR}/imgui"   # Assuming imgui is in the same directory as CMakeLists.txt
    "${CMAKE_SOURCE_DIR}/Source"
    # Add other include directories here if needed
)
# print out the include directories
get_target_property(TerrainApp_INCLUDE_DIRS TerrainApp INCLUDE_DIRECTORIES)
message(STATUS "Include directories for TerrainApp: ${TerrainApp_INCLUDE_DIRS}")

# Use find_library to locate opengl32.lib
find_library(OPENGL_LIB NAMES opengl32.lib)
if (NOT OPENGL_LIB)
    set(OPENGL_LIB "C:/Program Files (x86)/Windows Kits/10/Lib/${CMAKE_SYSTEM_VERSION}.0/um/x64/OpenGL32.Lib")
endif()

# Set the path to glfw3.lib
set(GLFW_LIB "${CMAKE_SOURCE_DIR}/Libraries/lib/glfw3.lib")

# Set the required libraries to link
target_link_libraries(TerrainApp PRIVATE
    ${GLFW_LIB}
    ${OPENGL_LIB}
)

### Set up the preprocessor definitions ###

# Assuming CMAKE_SOURCE_DIR points to your project's root
set(DIR_PATH "${CMAKE_SOURCE_DIR}")
set(SRC_PATH "${DIR_PATH}/Source")
set(SHADER_PATH "${SRC_PATH}/Shaders")

# Add these paths as compile definitions
add_definitions(-DDIR_PATH="${DIR_PATH}")
add_definitions(-DSRC_PATH="${SRC_PATH}")
add_definitions(-DSHADER_PATH="${SHADER_PATH}")

