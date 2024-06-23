use serde::Serialize;
use tauri::Manager;

use crate::MAIN_APP;

#[derive(Clone, Serialize)]
pub enum NotificationType {
    None,
    Info,
    Warning,
    Error,
}

#[derive(Clone, Serialize)]
pub struct Notification {
    pub r#type: NotificationType,
    pub title: String,
    pub body: String,
    pub duration: u32,
    pub code: String,
}

impl Notification {
    pub async fn send(self) {
        let app = MAIN_APP.lock().await;
        if let Some(app) = &*app {
            match app.emit("notification", self) {
                Ok(_) => (),
                Err(_) => println!("[bot::category_create()] Could not emit to windows"),
            }
        } else {
            println!("[bot::category_create()] No app found");
        }
    }
}
