extern crate prost_build;

use std::fs;
use std::path::{Path, PathBuf};

const MESSAGE_DIR: &'static str = "../common/messages";
const MESSAGE_ROOT: &'static str = "../common";

fn proto_files_in_dir(dir: &'static str) -> Vec<PathBuf> {
    fs::read_dir(Path::new(dir))
        .unwrap()
        .filter_map(|f| f.ok())
        .filter(|f| f.path().extension().is_some())
        .filter(|f| f.path().extension().unwrap() == "proto")
        .map(|f| f.path())
        .collect()
}

fn main() {
    prost_build::Config::new()
        .type_attribute(".", "#[derive(Serialize, Deserialize)]")
        .type_attribute(".", "#[serde(rename_all = \"snake_case\")]")
        .type_attribute(".", "#[serde(deny_unknown_fields)]")
        .compile_protos(
            proto_files_in_dir(MESSAGE_DIR).as_slice(),
            &[MESSAGE_ROOT.into()],
        )
        .unwrap();
}
