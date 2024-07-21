// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
pub mod client_commands;
pub mod discord;
pub mod notifications;
pub mod settings;
pub mod utils;

use std::sync::Arc;

use crate::client_commands::{
    create_discord_channel, delete_discord_channel, discord_create_reaction,
    discord_delete_message, discord_delete_reaction, discord_get_forum_channels, discord_login,
    discord_logout, discord_raw_edit, discord_raw_reply, edit_discord_channel,
    get_discord_channels, get_discord_direct_channels, get_discord_guild_info,
    get_discord_guild_member_info, get_discord_guild_members, get_discord_guilds,
    get_discord_messages, send_raw_discord_message, send_simple_discord_message,
    set_authorizations,
};
use crate::discord::DISCORD_CONTEXT;
use crate::settings::auth_saver::get_all_authorizations;
use lazy_static::lazy_static;
use serde_json::json;
use serenity::all::ShardManager;
use serenity::prelude::TypeMapKey;
use tauri::{AppHandle, Manager};
use tokio::sync::Mutex;

lazy_static! {
    pub static ref MAIN_APP: Arc<Mutex<Option<AppHandle>>> = Arc::new(Mutex::new(None));
}

pub struct ShardManagerContainer;
impl TypeMapKey for ShardManagerContainer {
    type Value = Arc<ShardManager>;
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
    } else if let Ok(auth_data) = get_all_authorizations().await {
        match app_handle.emit("saved-authorizations", &auth_data) {
            Ok(_) => (),
            Err(_) => println!("[lib::app_load()] Could not emit data to windows"),
        }
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() {
    let _ = self::settings::check_app_files_path().await;

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
            get_discord_direct_channels,
            discord_get_forum_channels,
            create_discord_channel,
            edit_discord_channel,
            delete_discord_channel,
            send_simple_discord_message,
            send_raw_discord_message,
            discord_raw_edit,
            discord_delete_message,
            discord_raw_reply,
            discord_create_reaction,
            discord_delete_reaction,
            get_discord_messages,
            set_authorizations
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
