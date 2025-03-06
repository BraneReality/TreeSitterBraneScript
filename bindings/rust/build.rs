fn main() {
    let cargo_manifest_dir = std::env::var("CARGO_MANIFEST_DIR").unwrap();
    let project_root = std::path::Path::new(cargo_manifest_dir.as_str());
    let src_dir = project_root.join("src");

    let mut c_config = cc::Build::new();
    c_config.std("c11").include(&src_dir);

    #[cfg(target_env = "msvc")]
    c_config.flag("-utf-8");

    let parser_path = src_dir.join("parser.c");
    c_config.file(&parser_path);
    println!("cargo:rerun-if-changed={}", parser_path.to_str().unwrap());

    // NOTE: if your language uses an external scanner, uncomment this block:
    /*
    let scanner_path = src_dir.join("scanner.c");
    c_config.file(&scanner_path);
    println!("cargo:rerun-if-changed={}", scanner_path.to_str().unwrap());
    */

    c_config.compile("tree-sitter-branescript");
}
