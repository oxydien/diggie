use std::fs;

use serde_json::json;
use serenity::prelude::*;
use tauri::Manager;

use crate::{discord::Handler, settings::get_app_files_path, MAIN_APP};

use super::DISCORD_CONTEXT;

pub async fn login(token: &str) -> Result<(), String> {
    match logout().await {
        Ok(_) => println!("[discord-api|login] Successfuly logged out!"),
        Err(err) => println!("Error while logging out: {:?}", err),
    }
    println!("[login::login] Creating client");
    let mut client = match init_client(token).await {
        Ok(val) => val,
        Err(err) => return Err(format!("Couldn't create client: {:?}", err)),
    };

    println!("[login::login] Starting client");
    if let Err(why) = client.start().await {
        println!("Client error: {:?}", why);

        let app_guard = MAIN_APP.lock().await;
        if let Some(app) = &*app_guard {
            match app.emit("discord-status", json!({"loggedIn": false})) {
                Ok(_) => (),
                Err(_) => println!("[discord-api|login] Could not emit to windows"),
            }
        }
    }
    Ok(())
}

async fn init_client(token: &str) -> Result<Client, String> {
    let intents = GatewayIntents::all();
    let client = Client::builder(token, intents)
        .event_handler(Handler)
        .await
        .map_err(|e| e.to_string());

    client
}

pub async fn logout() -> Result<(), String> {
    println!("[discord-api|logout]");
    let context_static = DISCORD_CONTEXT.lock().await;
    if let Some(ctx) = &*context_static {
        ctx.shard.shutdown_clean();
        println!("[discord-api|cleaned]");
    }
    Ok(())
}

pub async fn save_token(token: &str) -> Result<(), String> {
    let app_files_path = get_app_files_path();
    println!(
        "[save_token] Debug: Saving token to : {:?}/.saved_token",
        app_files_path
    );
    if !app_files_path.exists() {
        if let Err(err) = fs::create_dir_all(&app_files_path) {
            println!(
                "[login::save_token] Error while creating folders: {:?}",
                err
            );
            return Ok(());
        }
    }
    match tokio::fs::write(app_files_path.join(".saved_token"), token).await {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

pub async fn retrieve_token() -> Result<String, String> {
    let file_path = get_app_files_path().join(".saved_token");

    match fs::read(file_path) {
        Ok(data) => match String::from_utf8(data) {
            Ok(token_string) => Ok(token_string),
            Err(e) => Err(format!("Failed to convert bytes to string: {}", e)),
        },
        Err(e) => Err(e.to_string()),
    }
}
