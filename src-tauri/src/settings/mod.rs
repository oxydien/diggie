use std::{fs, path::PathBuf};

use crate::notifications::builder::NotificationBuilder;

pub mod auth_saver;
pub mod client_settings;

pub async fn get_app_files_path() -> PathBuf {
    if cfg!(target_os = "windows") {
        match std::env::var("APPDATA") {
            Ok(appdata) => {
                let mut path = PathBuf::from(appdata);
                path = path.join("diggie-client");
                path
            }
            Err(_) => panic!("Failed to get the %APPDATA% environment variable."),
        }
    } else if cfg!(target_os = "linux") {
        let mut path = std::env::var("XDG_CONFIG_HOME")
            .ok()
            .map(PathBuf::from)
            .filter(|p| p.is_absolute())
            .unwrap_or_else(|| {
                let mut path = std::env::var("HOME")
                    .ok()
                    .map(PathBuf::from)
                    .unwrap_or_else(|| panic!("Failed to get the $HOME environment variable."));
                path.push(".config");
                path
            });
        path.push("diggie-client");
        path
    } else {
        NotificationBuilder::error("Path find error", Some("Unsupported target OS for diggie-client"), Some(2), None::<String>)
                .send()
                .await;
        panic!("Unsupported target OS for diggie-client.");
    }
}

pub async fn check_app_files_path() {
    let path = get_app_files_path().await;

    if !path.exists() {
        if let Err(err) = fs::create_dir_all(&path) {
            eprintln!("Failed to create directory {}: {}", path.display(), err);
        }
    }
}
