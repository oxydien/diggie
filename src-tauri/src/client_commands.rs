use serenity::all::{
    Channel, GuildChannel, GuildInfo, Member, Message, PartialGuild, PrivateChannel, ThreadsData
};

use crate::discord::channels::{
    create_channel, delete_channel, edit_channel, get_channel_info, get_forum_channels,
    EditableChannel,
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
use crate::settings::client_settings::ClientSettings;

// # MARK: Discord login
#[tauri::command]
pub async fn discord_login(token: &str, should_save_token: bool) -> Result<(), String> {
    let mut token_saver = crate::discord::SHOULD_SAVE_NEXT_LOGIN.lock().await;
    *token_saver = should_save_token;
    drop(token_saver);
    crate::discord::login::login(token).await.unwrap();
    Ok(())
}

// # MARK: Discord logout
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

// # MARK: Discord guilds
#[tauri::command]
pub async fn get_discord_guilds() -> Result<Vec<GuildInfo>, String> {
    match get_guilds().await {
        Ok(data) => Ok(data),
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

// # MARK: D.. guild info
#[tauri::command]
pub async fn get_discord_guild_info(guild_id: &str) -> Result<PartialGuild, String> {
    let guild: u64 = guild_id.parse().unwrap();
    match get_guild_info(guild).await {
        Ok(data) => Ok(data),
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

// # MARK: D guild members
#[tauri::command]
pub async fn get_discord_guild_members(guild_id: &str) -> Result<Vec<Member>, String> {
    let guild: u64 = guild_id.parse().unwrap();
    match get_members(guild).await {
        Ok(data) => Ok(data),
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

// # MARK: D member info
#[tauri::command]
pub async fn get_discord_guild_member_info(
    guild_id: &str,
    user_id: &str,
) -> Result<Member, String> {
    let guild: u64 = guild_id.parse().unwrap();
    let user: u64 = user_id.parse().unwrap();

    match get_member_info(guild, user).await {
        Ok(data) => Ok(data),
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

// # MARK: D.. channels
#[tauri::command]
pub async fn get_discord_channels(guild_id: &str) -> Result<Vec<GuildChannel>, String> {
    let guild: u64 = guild_id.parse().unwrap();
    match get_channels(guild).await {
        Ok(data) => Ok(data),
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

// # MARK: Discord DMs
#[tauri::command]
pub async fn get_discord_direct_channels() -> Result<Vec<PrivateChannel>, String> {
    match get_direct_channels().await {
        Ok(data) => Ok(data),
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

// # MARK: D.. forums
#[tauri::command]
pub async fn discord_get_forum_channels(
    channel_id: &str,
    guild_id: &str,
) -> Result<ThreadsData, String> {
    let channel: u64 = channel_id.parse().unwrap();
    let guild: u64 = guild_id.parse().unwrap();

    match get_forum_channels(guild, channel).await {
        Ok(data) => Ok(data),
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

// # MARK: D.. get channel
#[tauri::command]
pub async fn get_discord_channel_info(channel_id: &str) -> Result<Channel, String> {
    let channel: u64 = channel_id.parse().unwrap();
    match get_channel_info(channel).await {
        Ok(data) => Ok(data),
        Err(e) => {
            NotificationBuilder::error(
                "Discord channel info fetch error",
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

// # MARK: D create channel
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

// # MARK: D edit channel
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

// # MARK: D delete channel
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

// # MARK: D send message
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

// # MARK: D raw message
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

// # MARK: D raw reply
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

// # MARK: D raw edit
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

// # MARK: D delete
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

// # MARK: D create reaction
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
            let err_data = err.clone();
            NotificationBuilder::error(
                "ERROR while adding reaction",
                Some(err.0),
                Some(5),
                Some(err.1),
            )
            .send()
            .await;
            return Err(format!("{}:{}", err_data.0, err_data.1));
        }
    }
}

// # MARK: D delete reaction
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
            let err_data = err.clone();
            NotificationBuilder::error(
                "ERROR while removing reaction",
                Some(err.0),
                Some(5),
                Some(err.1),
            )
            .send()
            .await;
            return Err(format!("{}:{}", err_data.0, err_data.1));
        }
    }
}

// # MARK: D get messages
#[tauri::command]
pub async fn get_discord_messages(channel_id: &str) -> Result<Vec<Message>, String> {
    let channel: u64 = channel_id.parse().unwrap();
    match get_messages(channel).await {
        Ok(data) => Ok(data),
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

// # MARK: Settings set auth
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

// # MARK: Get Client Settings
#[tauri::command]
pub async fn get_client_settings() -> Result<ClientSettings, String> {
    let settings = ClientSettings::load().await;
    match settings {
        Ok(data) => Ok(data),
        Err(err) => {
            NotificationBuilder::error(
                "Couldn't get client settings",
                Some(""),
                Some(5),
                Some(err.to_string()),
            )
            .send()
            .await;
            return Err(err.to_string());
        }
    }
}

// # MARK: Set Client Settings
#[tauri::command]
pub async fn set_client_settings(data: &str) -> Result<String, String> {
    let settings: ClientSettings = serde_json::from_str(data).unwrap();
    if let Err(err) = settings.save().await {
        NotificationBuilder::error(
            "Couldn't save client settings",
            Some(""),
            Some(5),
            Some(err.to_string()),
        )
        .send()
        .await;
        eprintln!(
            "[set_client_settings] Couldn't save client settings: {}",
            err
        );
        return Err(err.to_string());
    }
    Ok(String::from("Successfully saved client settings"))
}
