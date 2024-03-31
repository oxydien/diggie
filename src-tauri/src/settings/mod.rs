use std::path::PathBuf;

pub mod auth_saver;

pub fn get_app_files_path() -> PathBuf {
    match std::env::var("APPDATA") {
        Ok(appdata) => {
            let mut path = PathBuf::from(appdata);
            path = path.join("diggie-client");
            path
        }
        Err(_) => panic!("Failed to get the %APPDATA% environment variable."),
    }
}
