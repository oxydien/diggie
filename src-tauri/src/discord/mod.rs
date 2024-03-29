use serde_json::json;
use std::sync::Arc;
use tauri::Manager;
use tokio::sync::Mutex;

use lazy_static::lazy_static;
use serenity::{
    all::{
        ChannelId, Context, EventHandler, GuildId, Message, MessageId, MessageUpdateEvent,
        Presence, Reaction, Ready,
    },
    async_trait,
};

use crate::MAIN_APP;

pub mod channels;
pub mod guilds;
pub mod login;
pub mod members;
pub mod messages;
pub mod reactions;

lazy_static! {
    pub static ref DISCORD_CONTEXT: Arc<Mutex<Option<Context>>> = Arc::new(Mutex::new(None));
}

struct Handler;

#[async_trait]
impl EventHandler for Handler {
    async fn message(&self, _ctx: Context, msg: Message) {
        let app_guard = MAIN_APP.lock().await;
        if let Some(app) = &*app_guard {
            match app.emit("discord-message", msg) {
                Ok(_) => (),
                Err(_) => println!("[bot::message()] Could not emit to windows"),
            }
        }
    }

    async fn reaction_add(&self, _ctx: Context, reaction_add: Reaction) {
        let app_guard = MAIN_APP.lock().await;
        if let Some(app) = &*app_guard {
            match app.emit("discord-reaction-add", reaction_add) {
                Ok(_) => (),
                Err(_) => println!("[bot::reaction_add()] Could not emit to windows"),
            }
        }
    }

    async fn reaction_remove(&self, _ctx: Context, reaction_remove: Reaction) {
        let app_guard = MAIN_APP.lock().await;
        if let Some(app) = &*app_guard {
            match app.emit("discord-reaction-remove", reaction_remove) {
                Ok(_) => (),
                Err(_) => println!("[bot::reaction_remove()] Could not emit to windows"),
            }
        }
    }

    async fn ready(&self, ctx: Context, ready: Ready) {
        println!("{} is connected!", ready.user.name);
        let app_guard = MAIN_APP.lock().await;
        *DISCORD_CONTEXT.lock().await = Some(ctx);
        if let Some(app) = &*app_guard {
            match app.emit("discord-status", json!({"loggedIn": true})) {
                Ok(_) => (),
                Err(_) => println!("[bot::ready()] Could not emit to windows"),
            }
            match app.emit("user-info", serde_json::to_string(&ready.user).unwrap()) {
                Ok(_) => (),
                Err(_) => println!("[bot::ready()] Could not emit data to windows"),
            }
        }
    }
    async fn presence_update(&self, _ctx: Context, new_data: Presence) {
        let app_guard = MAIN_APP.lock().await;
        if let Some(app) = &*app_guard {
            match app.emit("discord-presence-update", new_data) {
                Ok(_) => (),
                Err(_) => println!("[bot::presence_update()] Could not emit to windows"),
            }
        }
    }
    async fn message_update(
        &self,
        _ctx: Context,
        old_if_available: Option<Message>,
        new: Option<Message>,
        event: MessageUpdateEvent,
    ) {
        let app_guard = MAIN_APP.lock().await;
        if let Some(app) = &*app_guard {
            match app.emit(
                "discord-message-update",
                json!({
                    "old": old_if_available,
                    "new": new,
                    "event": event
                }),
            ) {
                Ok(_) => (),
                Err(_) => println!("[bot::presence_update()] Could not emit to windows"),
            }
        }
    }
    async fn message_delete(
        &self,
        _ctx: Context,
        channel_id: ChannelId,
        deleted_message_id: MessageId,
        guild_id: Option<GuildId>,
    ) {
        let app_guard = MAIN_APP.lock().await;
        if let Some(app) = &*app_guard {
            match app.emit(
                "discord-message-delete",
                json!({
                    "channel-id": channel_id,
                    "message-id": deleted_message_id,
                    "guild-id": guild_id
                }),
            ) {
                Ok(_) => (),
                Err(_) => println!("[bot::presence_update()] Could not emit to windows"),
            }
        }
    }
}
