cmake_minimum_required(VERSION 3.4.1)

add_library(llm_module SHARED
            llm_module.cpp)

target_link_libraries(llm_module
                      android
                      log)