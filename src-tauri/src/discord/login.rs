use serde_json::json;
use serenity::{model::prelude::*, prelude::*};
use tauri::Manager;

use crate::{
    discord::Handler, notifications::builder::NotificationBuilder, ShardManagerContainer, MAIN_APP,
};

use super::DISCORD_CONTEXT;

pub async fn login(token: &str) -> Result<(), String> {
    match logout().await {
        Ok(_) => println!("[discord-api|login] Successfully logged out!"),
        Err(err) => {
            let _ = NotificationBuilder::warning(
                "Error while logging out",
                Some(""),
                Some(3),
                Some(err.clone()),
            )
            .send()
            .await;
            println!("Error while logging out: {:?}", err)
        }
    }
    println!("[login::login] Creating client");
    let mut client = match init_client(token).await {
        Ok(val) => val,
        Err(err) => {
            let _ = NotificationBuilder::error(
                "Couldn't create client",
                Some(""),
                Some(3),
                Some(err.clone()),
            )
            .send()
            .await;
            return Err(format!("Couldn't create client: {:?}", err));
        }
    };

    {
        let mut data = client.data.write().await;
        data.insert::<ShardManagerContainer>(client.shard_manager.clone());
    }

    println!("[login::login] Starting client");
    let _ = NotificationBuilder::info("Starting client", Some(""), Some(3), Some(""))
        .send()
        .await;
    if let Err(why) = client.start().await {
        println!("Client error: {:?}", why);
        let _ = NotificationBuilder::error("Client error", Some(""), Some(3), Some(why))
            .send()
            .await;

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
    let mut context_static = DISCORD_CONTEXT.lock().await;
    if let Some(ctx) = &*context_static {
        ctx.shard.shutdown_clean();
        let data = ctx.data.read().await;

        if let Some(manager) = data.get::<ShardManagerContainer>() {
            manager.shutdown_all().await;
        }
        println!("[discord-api|logout] Cleaned context");
        let app_guard = MAIN_APP.lock().await;
        if let Some(app) = &*app_guard {
            match app.emit("discord-status", json!({"loggedIn": false})) {
                Ok(_) => (),
                Err(_) => println!("[discord-api|logout] Could not emit to windows"),
            }
        }
    }
    *context_static = None;
    Ok(())
}
