// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
pub mod client_commands;
pub mod discord;
pub mod settings;

use std::sync::Arc;

use crate::client_commands::{
    discord_create_reaction, discord_delete_message, discord_delete_reaction,
    discord_get_forum_channels, discord_login, discord_logout, discord_raw_edit, discord_raw_reply,
    get_discord_channels, get_discord_dirrect_channels, get_discord_guild_info,
    get_discord_guild_member_info, get_discord_guild_members, get_discord_guilds,
    get_discord_messages, send_raw_discord_message, send_simple_discord_message,
};
use crate::discord::login::login;
use crate::discord::DISCORD_CONTEXT;
use discord::login::retrieve_token;
use lazy_static::lazy_static;
use serde_json::json;
use tauri::{AppHandle, Manager};
use tokio::sync::Mutex;

lazy_static! {
    pub static ref MAIN_APP: Arc<Mutex<Option<AppHandle>>> = Arc::new(Mutex::new(None));
}

#[tauri::command]
async fn app_load(app_handle: AppHandle) -> Result<(), String> {
    println!("App loaded!");
    *MAIN_APP.lock().await = Some(app_handle.clone());
    let context_guard = DISCORD_CONTEXT.lock().await;
    if let Some(ctx) = context_guard.as_ref() {
        let current_user = ctx.http.get_current_user().await.unwrap();
        match app_handle.emit("discord-status", json!({"loggedIn": true})) {
            Ok(_) => (),
            Err(_) => println!("[bot::app_load()] Could not emit to windows"),
        }
        match app_handle.emit("user-info", serde_json::to_string(&current_user).unwrap()) {
            Ok(_) => (),
            Err(_) => println!("[lib::app_load()] Could not emit data to windows"),
        }
    } else if let Ok(val) = retrieve_token().await {
        drop(context_guard);
        println!("[lib::app_load()] Auto logging as {}", val);
        match app_handle.emit(
            "discord-status",
            json!({"loggedIn": false, "autoLog": true}),
        ) {
            Ok(_) => (),
            Err(_) => println!("[bot::ready()] Could not emit to windows"),
        }
        let _ = login(&val).await;
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            app_load,
            discord_login,
            discord_logout,
            get_discord_guilds,
            get_discord_guild_info,
            get_discord_guild_members,
            get_discord_guild_member_info,
            get_discord_channels,
            get_discord_dirrect_channels,
            discord_get_forum_channels,
            send_simple_discord_message,
            send_raw_discord_message,
            discord_raw_edit,
            discord_delete_message,
            discord_raw_reply,
            discord_create_reaction,
            discord_delete_reaction,
            get_discord_messages
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
