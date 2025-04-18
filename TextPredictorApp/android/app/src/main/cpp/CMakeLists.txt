cmake_minimum_required(VERSION 3.4.1)

# Comment out llama.cpp build options
# set(LLAMA_BLAS ON CACHE BOOL "llama: use BLAS" FORCE)
# set(LLAMA_CUBLAS OFF CACHE BOOL "llama: use CUBLAS" FORCE)
# set(LLAMA_METAL OFF CACHE BOOL "llama: use Metal" FORCE)
# set(LLAMA_BUILD_EXAMPLES OFF CACHE BOOL "llama: build examples" FORCE)
# set(LLAMA_BUILD_TESTS OFF CACHE BOOL "llama: build tests" FORCE)

# Comment out llama.cpp as a subdirectory
# add_subdirectory(llama.cpp)

# Create your module
add_library(llm_module SHARED
            llm_module.cpp)

# Update include directories
target_include_directories(llm_module PRIVATE
                          ${CMAKE_CURRENT_SOURCE_DIR})

# Link against required libraries only (not llama)
target_link_libraries(llm_module
                      android
                      log)