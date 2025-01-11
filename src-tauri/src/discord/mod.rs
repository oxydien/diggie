use serde_json::json;
use std::{sync::Arc, time};
use tauri::Manager;
use tokio::sync::Mutex;

use lazy_static::lazy_static;
use serenity::{
    all::{
        ChannelId, Context, EventHandler, GuildChannel, GuildId, Message, MessageId,
        MessageUpdateEvent, Presence, Reaction, Ready,
    },
    async_trait,
};

use crate::{
    notifications::builder::NotificationBuilder,
    settings::auth_saver::{set_all_authorizations, Account, SavedAuth},
    MAIN_APP,
};

pub mod channels;
pub mod guilds;
pub mod login;
pub mod members;
pub mod messages;
pub mod reactions;

macro_rules! emit_to_app {
    ($name:expr, $($key:expr => $value:expr),+) => {
        if let Some(app) = &*MAIN_APP.lock().await {
            if let Err(_) = app.emit(($name), json!({ $($key: $value),+ })) {
                eprintln!("[bot::event-{}] Could not emit to windows", stringify!($name));
            }
        }
    };
}

lazy_static! {
    pub static ref DISCORD_CONTEXT: Arc<Mutex<Option<Context>>> = Arc::new(Mutex::new(None));
    pub static ref SHOULD_SAVE_NEXT_LOGIN: Arc<Mutex<bool>> = Arc::new(Mutex::new(false));
}

struct Handler;

#[async_trait]
impl EventHandler for Handler {
    async fn message(&self, _ctx: Context, msg: Message) {
        emit_to_app!("discord-message", "message" => msg);
    }

    async fn reaction_add(&self, _ctx: Context, reaction_add: Reaction) {
        emit_to_app!("discord-reaction-add", "reaction" => reaction_add);
    }

    async fn reaction_remove(&self, _ctx: Context, reaction_remove: Reaction) {
        emit_to_app!("discord-reaction-remove", "reaction" => reaction_remove);
    }
    async fn channel_update(&self, _ctx: Context, old: Option<GuildChannel>, new: GuildChannel) {
        emit_to_app!("discord-channel-update", "old" => old, "new" => new);
    }
    async fn channel_create(&self, _ctx: Context, channel: GuildChannel) {
        emit_to_app!("discord-channel-create", "channel" => channel);
    }
    async fn channel_delete(
        &self,
        _ctx: Context,
        channel: GuildChannel,
        _messages: Option<Vec<Message>>,
    ) {
        emit_to_app!("discord-channel-delete", "channel" => channel);
    }
    async fn category_create(&self, _ctx: Context, category: GuildChannel) {
        emit_to_app!("discord-channel-create", "channel" => category);
    }
    async fn category_delete(&self, _ctx: Context, category: GuildChannel) {
        emit_to_app!("discord-channel-delete", "channel" => category);
    }

    async fn ready(&self, ctx: Context, ready: Ready) {
        println!("{} is connected!", ready.user.name);

        // Saving authorizations
        let token = ctx.http.token().to_string();
        match crate::settings::auth_saver::get_all_authorizations().await {
            Ok(mut auths) => {
                // Check if the bot already exists in the list of saved authorizations
                let bot_exists = auths
                    .iter_mut()
                    .find(|auth| auth.account.id == ready.user.id.to_string());
                if let Some(existing_bot) = bot_exists {
                    println!("Updating already saved account!");
                    // Update the last touched time
                    existing_bot.last_touched = time::SystemTime::now();
                } else {
                    // If it doesn't exist, check if the user wants to save the authorization
                    let should_save = *SHOULD_SAVE_NEXT_LOGIN.lock().await;
                    if should_save {
                        println!("Saving new account!");
                        // Add a new authorization to the list
                        auths.push(SavedAuth {
                            token,
                            last_touched: time::SystemTime::now(),
                            account: Account {
                                id: ready.user.id.to_string(),
                                username: ready.user.name.clone(),
                                avatar: ready.user.avatar.map(|hash| hash.to_string()),
                            },
                        });
                        // Reset the flag
                        *SHOULD_SAVE_NEXT_LOGIN.lock().await = false;
                    }
                }
                // Save the new list of authorizations
                if let Err(err) = set_all_authorizations(auths).await {
                    eprintln!(
                        "[discord::mod::ready] Couldn't save authorizations: {}",
                        err
                    );
                    NotificationBuilder::error(
                        "Couldn't save authorizations",
                        Some(""),
                        Some(5),
                        Some(err),
                    )
                    .send()
                    .await
                }
            }
            Err(err) => eprintln!("{}", err),
        }
        *DISCORD_CONTEXT.lock().await = Some(ctx);

        // Send signal to discord client
        emit_to_app!("discord-status", "loggedIn" => true);
        emit_to_app!("user-info", "current_user" => &ready.user);
    }
    async fn presence_update(&self, _ctx: Context, new_data: Presence) {
        emit_to_app!("discord-presence-update", "data" => new_data);
    }
    async fn message_update(
        &self,
        _ctx: Context,
        old_if_available: Option<Message>,
        new: Option<Message>,
        event: MessageUpdateEvent,
    ) {
        emit_to_app!("discord-message-update", "old" => old_if_available, "new" => new, "event" => event);
    }
    async fn message_delete(
        &self,
        _ctx: Context,
        channel_id: ChannelId,
        deleted_message_id: MessageId,
        guild_id: Option<GuildId>,
    ) {
        emit_to_app!("discord-message-delete", "channel_id" => channel_id, "message_id" => deleted_message_id, "guild_id" => guild_id);
    }
}
