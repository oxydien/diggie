use serenity::all::{Channel, GuildChannel};

use crate::discord::channels::{
    create_channel, delete_channel, edit_channel, get_forum_channels, EditableChannel,
};
use crate::discord::messages::{delete_message, edit_message, reply_to_message};
use crate::discord::{
    channels::{get_channels, get_direct_channels},
    guilds::{get_guild_info, get_guilds},
    login::logout,
    members::{get_member_info, get_members},
    messages::{get_messages, send_message, send_raw_message},
    reactions::{add_reaction, remove_reaction},
};
use crate::notifications::builder::NotificationBuilder;
use crate::settings::auth_saver::{set_all_authorizations, SavedAuth};

#[tauri::command]
pub async fn discord_login(token: &str, should_save_token: bool) -> Result<(), String> {
    let mut token_saver = crate::discord::SHOULD_SAVE_NEXT_LOGIN.lock().await;
    *token_saver = should_save_token;
    drop(token_saver);
    crate::discord::login::login(token).await.unwrap();
    Ok(())
}

#[tauri::command]
pub async fn discord_logout() -> Result<(), String> {
    match logout().await {
        Ok(_) => Ok(()),
        Err(e) => {
            NotificationBuilder::error("Discord logout error", Some(""), Some(5), Some(e.clone()))
                .send()
                .await;
            return Err(e);
        }
    }
}

#[tauri::command]
pub async fn get_discord_guilds() -> Result<String, String> {
    match get_guilds().await {
        Ok(data) => Ok(serde_json::to_string(&data).unwrap()),
        Err(e) => {
            NotificationBuilder::error(
                "Discord guilds fetch error",
                Some(""),
                Some(5),
                Some(e.clone()),
            )
            .send()
            .await;
            return Err(String::from("Couldn't get guilds"));
        }
    }
}

#[tauri::command]
pub async fn get_discord_guild_info(guild_id: &str) -> Result<String, String> {
    let guild: u64 = guild_id.parse().unwrap();
    match get_guild_info(guild).await {
        Ok(data) => Ok(serde_json::to_string(&data).unwrap()),
        Err(e) => {
            NotificationBuilder::error(
                "Discord guild info fetch error",
                Some(""),
                Some(5),
                Some(e.clone()),
            )
            .send()
            .await;
            return Err(e);
        }
    }
}

#[tauri::command]
pub async fn get_discord_guild_members(guild_id: &str) -> Result<String, String> {
    let guild: u64 = guild_id.parse().unwrap();
    match get_members(guild).await {
        Ok(data) => Ok(serde_json::to_string(&data).unwrap()),
        Err(e) => {
            NotificationBuilder::error(
                "Discord members fetch error",
                Some(""),
                Some(5),
                Some(e.clone()),
            )
            .send()
            .await;
            return Err(e);
        }
    }
}

#[tauri::command]
pub async fn get_discord_guild_member_info(
    guild_id: &str,
    user_id: &str,
) -> Result<String, String> {
    let guild: u64 = guild_id.parse().unwrap();
    let user: u64 = user_id.parse().unwrap();

    match get_member_info(guild, user).await {
        Ok(data) => Ok(serde_json::to_string(&data).unwrap()),
        Err(e) => {
            NotificationBuilder::error(
                "Discord member info fetch error",
                Some(""),
                Some(5),
                Some(e.clone()),
            )
            .send()
            .await;
            return Err(e);
        }
    }
}

#[tauri::command]
pub async fn get_discord_channels(guild_id: &str) -> Result<String, String> {
    let guild: u64 = guild_id.parse().unwrap();
    match get_channels(guild).await {
        Ok(data) => Ok(serde_json::to_string(&data).unwrap()),
        Err(e) => {
            NotificationBuilder::error(
                "Discord channels fetch error",
                Some(""),
                Some(5),
                Some(e.clone()),
            )
            .send()
            .await;
            return Err(e);
        }
    }
}

#[tauri::command]
pub async fn get_discord_direct_channels() -> Result<String, String> {
    match get_direct_channels().await {
        Ok(data) => Ok(serde_json::to_string(&data).unwrap()),
        Err(e) => {
            NotificationBuilder::error(
                "Discord DM fetch error",
                Some(""),
                Some(5),
                Some(e.clone()),
            )
            .send()
            .await;
            return Err(e);
        }
    }
}

#[tauri::command]
pub async fn discord_get_forum_channels(
    channel_id: &str,
    guild_id: &str,
) -> Result<String, String> {
    let channel: u64 = channel_id.parse().unwrap();
    let guild: u64 = guild_id.parse().unwrap();

    match get_forum_channels(guild, channel).await {
        Ok(data) => Ok(serde_json::to_string(&data).unwrap()),
        Err(e) => {
            NotificationBuilder::error(
                "Discord forum channels fetch error",
                Some(""),
                Some(5),
                Some(e.clone()),
            )
            .send()
            .await;
            return Err(e);
        }
    }
}

#[tauri::command]
pub async fn create_discord_channel(guild_id: &str, data: &str) -> Result<GuildChannel, String> {
    let guild: u64 = guild_id.parse().unwrap();
    let raw_json: EditableChannel = serde_json::from_str(data).unwrap();
    match create_channel(guild, raw_json).await {
        Ok(data) => Ok(data),
        Err(err) => {
            NotificationBuilder::error(
                "Discord create channel error",
                Some(""),
                Some(5),
                Some(err.clone()),
            )
            .send()
            .await;
            return Err(err);
        }
    }
}

#[tauri::command]
pub async fn edit_discord_channel(channel_id: &str, data: &str) -> Result<GuildChannel, String> {
    let channel: u64 = channel_id.parse().unwrap();
    let raw_json: EditableChannel = serde_json::from_str(data).unwrap();
    match edit_channel(channel, raw_json).await {
        Ok(data) => Ok(data),
        Err(err) => {
            NotificationBuilder::error(
                "Discord edit channel error",
                Some(""),
                Some(5),
                Some(err.clone()),
            )
            .send()
            .await;
            return Err(err);
        }
    }
}

#[tauri::command]
pub async fn delete_discord_channel(channel_id: &str) -> Result<Channel, String> {
    let channel: u64 = channel_id.parse().unwrap();
    match delete_channel(channel).await {
        Ok(data) => Ok(data),
        Err(err) => {
            NotificationBuilder::error(
                "Discord delete channel error",
                Some(""),
                Some(5),
                Some(err.clone()),
            )
            .send()
            .await;
            return Err(err);
        }
    }
}

#[tauri::command]
pub async fn send_simple_discord_message(channel_id: &str, content: &str) -> Result<(), String> {
    let channel: u64 = channel_id.parse().unwrap();
    match send_message(channel, content).await {
        Ok(_) => Ok(()),
        Err(err) => {
            NotificationBuilder::error(
                "ERROR while sending simple message",
                Some(""),
                Some(5),
                Some(err.clone()),
            )
            .send()
            .await;
            return Err(err);
        }
    }
}

#[tauri::command]
pub async fn send_raw_discord_message(channel_id: &str, content: &str) -> Result<(), String> {
    let channel: u64 = channel_id.parse().unwrap();
    match send_raw_message(channel, content).await {
        Ok(_) => Ok(()),
        Err(err) => {
            NotificationBuilder::error(
                "ERROR while sending raw message",
                Some(""),
                Some(5),
                Some(err.clone()),
            )
            .send()
            .await;
            return Err(err);
        }
    }
}

#[tauri::command]
pub async fn discord_raw_reply(
    channel_id: &str,
    message_id: &str,
    data: &str,
) -> Result<(), String> {
    let channel: u64 = channel_id.parse().unwrap();
    let message: u64 = message_id.parse().unwrap();

    match reply_to_message(channel, message, data).await {
        Ok(_) => Ok(()),
        Err(err) => {
            NotificationBuilder::error(
                "ERROR while replying raw to message",
                Some(""),
                Some(5),
                Some(err.clone()),
            )
            .send()
            .await;
            return Err(err);
        }
    }
}

#[tauri::command]
pub async fn discord_raw_edit(
    channel_id: &str,
    message_id: &str,
    data: &str,
) -> Result<(), String> {
    let channel: u64 = channel_id.parse().unwrap();
    let message: u64 = message_id.parse().unwrap();

    match edit_message(channel, message, data).await {
        Ok(_) => Ok(()),
        Err(err) => {
            NotificationBuilder::error(
                "ERROR while editing a message",
                Some(""),
                Some(5),
                Some(err.clone()),
            )
            .send()
            .await;
            return Err(err);
        }
    }
}

#[tauri::command]
pub async fn discord_delete_message(channel_id: &str, message_id: &str) -> Result<(), String> {
    let channel: u64 = channel_id.parse().unwrap();
    let message: u64 = message_id.parse().unwrap();

    match delete_message(channel, message).await {
        Ok(_) => Ok(()),
        Err(err) => {
            NotificationBuilder::error(
                "ERROR while removing a message",
                Some(""),
                Some(5),
                Some(err.clone()),
            )
            .send()
            .await;
            return Err(err);
        }
    }
}

#[tauri::command]
pub async fn discord_create_reaction(
    channel_id: &str,
    message_id: &str,
    emoji: &str,
) -> Result<(), String> {
    let channel: u64 = channel_id.parse().unwrap();
    let message: u64 = message_id.parse().unwrap();
    match add_reaction(channel, message, emoji).await {
        Ok(_) => Ok(()),
        Err(err) => {
            NotificationBuilder::error(
                "ERROR while adding reaction",
                Some(""),
                Some(5),
                Some(err.clone()),
            )
            .send()
            .await;
            return Err(err);
        }
    }
}

#[tauri::command]
pub async fn discord_delete_reaction(
    channel_id: &str,
    message_id: &str,
    emoji: &str,
) -> Result<(), String> {
    let channel: u64 = channel_id.parse().unwrap();
    let message: u64 = message_id.parse().unwrap();
    match remove_reaction(channel, message, emoji).await {
        Ok(_) => Ok(()),
        Err(err) => {
            NotificationBuilder::error(
                "ERROR while removing reaction",
                Some(""),
                Some(5),
                Some(err.clone()),
            )
            .send()
            .await;
            return Err(err);
        }
    }
}

#[tauri::command]
pub async fn get_discord_messages(channel_id: &str) -> Result<String, String> {
    let channel: u64 = channel_id.parse().unwrap();
    match get_messages(channel).await {
        Ok(data) => Ok(serde_json::to_string(&data).unwrap()),
        Err(err) => {
            NotificationBuilder::error(
                "Discord messages fetch error",
                Some(""),
                Some(5),
                Some(err.clone()),
            )
            .send()
            .await;
            return Err(err);
        }
    }
}

#[tauri::command]
pub async fn set_authorizations(data: &str) -> Result<String, String> {
    let authorizations: Vec<SavedAuth> = serde_json::from_str(data).unwrap();
    if let Err(err) = set_all_authorizations(authorizations).await {
        NotificationBuilder::error(
            "Couldn't save authorizations",
            Some(""),
            Some(5),
            Some(err.clone()),
        )
        .send()
        .await;
        eprintln!(
            "[set_authorizations] Couldn't save authorizations: {:?}",
            err
        );
        return Err(err);
    }
    Ok(String::from("Successfully saved authorizations"))
}
