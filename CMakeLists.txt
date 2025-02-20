cmake_minimum_required(VERSION 3.13)

project(tree-sitter-branescript
        VERSION "0.1.0"
        DESCRIPTION "Parser for BraneScript's text representation"
        HOMEPAGE_URL "https://github.com/wirewhiz/treesitterbranescript"
        LANGUAGES C)

option(BUILD_SHARED_LIBS "Build using shared libraries" ON)
option(TREE_SITTER_REUSE_ALLOCATOR "Reuse the library allocator" OFF)

set(TREE_SITTER_ABI_VERSION 14 CACHE STRING "Tree-sitter ABI version")
if(NOT ${TREE_SITTER_ABI_VERSION} MATCHES "^[0-9]+$")
    unset(TREE_SITTER_ABI_VERSION CACHE)
    message(FATAL_ERROR "TREE_SITTER_ABI_VERSION must be an integer")
endif()

find_program(TREE_SITTER_CLI tree-sitter DOC "Tree-sitter CLI")
find_package (Python COMPONENTS Interpreter)

set(PARSER_C "${CMAKE_CURRENT_SOURCE_DIR}/src/parser.c")
set(ENUMS_H "${CMAKE_CURRENT_SOURCE_DIR}/src/parserEnums.h")
add_custom_command(OUTPUT ${PARSER_C} ${ENUMS_H} 
                   DEPENDS "${CMAKE_CURRENT_SOURCE_DIR}/grammar.js"
                   COMMAND "${TREE_SITTER_CLI}" generate
                            --abi=${TREE_SITTER_ABI_VERSION}
                   COMMAND "${Python_EXECUTABLE}" "extractEnums.py" "${PARSER_C}" "${ENUMS_H}" "ts_symbol_identifiers" "ts_field_identifiers"
                   WORKING_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}"
                   COMMENT "Generating parser.c & parser.h")

add_library(tree-sitter-branescript src/parser.c)
if(EXISTS src/scanner.c)
  target_sources(tree-sitter-branescript PRIVATE src/scanner.c)
endif()
target_include_directories(tree-sitter-branescript PRIVATE src)

target_compile_definitions(tree-sitter-branescript PRIVATE
                           $<$<BOOL:${TREE_SITTER_REUSE_ALLOCATOR}>:TREE_SITTER_REUSE_ALLOCATOR>
                           $<$<CONFIG:Debug>:TREE_SITTER_DEBUG>)

set_target_properties(tree-sitter-branescript
                      PROPERTIES
                      C_STANDARD 11
                      POSITION_INDEPENDENT_CODE ON
                      SOVERSION "${TREE_SITTER_ABI_VERSION}.${PROJECT_VERSION_MAJOR}"
                      DEFINE_SYMBOL "")

configure_file(bindings/c/tree-sitter-branescript.pc.in
               "${CMAKE_CURRENT_BINARY_DIR}/tree-sitter-branescript.pc" @ONLY)

include(GNUInstallDirs)

install(FILES bindings/c/tree-sitter-branescript.h
        DESTINATION "${CMAKE_INSTALL_INCLUDEDIR}/tree_sitter")
install(FILES "${CMAKE_CURRENT_BINARY_DIR}/tree-sitter-branescript.pc"
        DESTINATION "${CMAKE_INSTALL_DATAROOTDIR}/pkgconfig")
install(TARGETS tree-sitter-branescript
        LIBRARY DESTINATION "${CMAKE_INSTALL_LIBDIR}")

    #had to change this from test to testing to avoid conflit in ctest in BraneScript repo
add_custom_target(testing "${TREE_SITTER_CLI}" test
                  WORKING_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}"
                  COMMENT "tree-sitter test")

# vim:ft=cmake:
