use crate::discord::channels::get_forum_channels;
use crate::discord::messages::{delete_message, edit_message, reply_to_message};
use crate::discord::{
    channels::{get_channels, get_dirrect_channels},
    guilds::{get_guild_info, get_guilds},
    login::logout,
    members::{get_member_info, get_members},
    messages::{get_messages, send_message, send_raw_message},
    reactions::{add_reaction, remove_reaction},
};

#[tauri::command]
pub async fn discord_login(token: &str, should_save_token: bool) -> Result<(), String> {
    if should_save_token == true {
        match crate::discord::login::save_token(token).await {
            Ok(_) => println!("[client_commands::discord_login] Token saved successfully."),
            Err(e) => println!(
                "[client_commands::discord_login] Failed to save token: {}",
                e
            ),
        }
    }
    crate::discord::login::login(token).await.unwrap();
    Ok(())
}

#[tauri::command]
pub async fn discord_logout() -> Result<(), String> {
    match logout().await {
        Ok(_) => Ok(()),
        Err(e) => Err(e),
    }
}

#[tauri::command]
pub async fn get_discord_guilds() -> Result<String, String> {
    match get_guilds().await {
        Ok(data) => Ok(serde_json::to_string(&data).unwrap()),
        Err(_) => Err(String::from("Couldn't get guilds")),
    }
}

#[tauri::command]
pub async fn get_discord_guild_info(guild_id: &str) -> Result<String, String> {
    let guild: u64 = guild_id.parse().unwrap();
    match get_guild_info(guild).await {
        Ok(data) => Ok(serde_json::to_string(&data).unwrap()),
        Err(_) => Err(String::from("Couldn't get guild info")),
    }
}

#[tauri::command]
pub async fn get_discord_guild_members(guild_id: &str) -> Result<String, String> {
    let guild: u64 = guild_id.parse().unwrap();
    match get_members(guild).await {
        Ok(data) => Ok(serde_json::to_string(&data).unwrap()),
        Err(_) => Err(String::from("Couldn't get members")),
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
        Err(_) => Err(String::from("Couldn't get member info")),
    }
}

#[tauri::command]
pub async fn get_discord_channels(guild_id: &str) -> Result<String, String> {
    let guild: u64 = guild_id.parse().unwrap();
    match get_channels(guild).await {
        Ok(data) => Ok(serde_json::to_string(&data).unwrap()),
        Err(_) => Err(String::from("Couldn't get channels")),
    }
}

#[tauri::command]
pub async fn get_discord_dirrect_channels() -> Result<String, String> {
    match get_dirrect_channels().await {
        Ok(data) => Ok(serde_json::to_string(&data).unwrap()),
        Err(_) => Err(String::from("Couldn't get channels")),
    }
}

#[tauri::command]
pub async fn discord_get_forum_channels(channel_id: &str) -> Result<String, String> {
    let channel: u64 = channel_id.parse().unwrap();

    match get_forum_channels(channel).await {
        Ok(data) => Ok(serde_json::to_string(&data).unwrap()),
        Err(err) => Err(err),
    }
}

#[tauri::command]
pub async fn send_simple_discord_message(channel_id: &str, content: &str) -> Result<(), String> {
    let channel: u64 = channel_id.parse().unwrap();
    match send_message(channel, content).await {
        Ok(_) => Ok(()),
        Err(err) => Err(err),
    }
}

#[tauri::command]
pub async fn send_raw_discord_message(channel_id: &str, content: &str) -> Result<(), String> {
    let channel: u64 = channel_id.parse().unwrap();
    match send_raw_message(channel, content).await {
        Ok(_) => Ok(()),
        Err(err) => Err(err),
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
        Err(err) => Err(err),
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
        Err(err) => Err(err),
    }
}

#[tauri::command]
pub async fn discord_delete_message(channel_id: &str, message_id: &str) -> Result<(), String> {
    let channel: u64 = channel_id.parse().unwrap();
    let message: u64 = message_id.parse().unwrap();

    match delete_message(channel, message).await {
        Ok(_) => Ok(()),
        Err(err) => Err(err),
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
        Err(_) => Err(String::from("Couldn't add reaction")),
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
        Err(_) => Err(String::from("Couldn't remove reaction")),
    }
}

#[tauri::command]
pub async fn get_discord_messages(channel_id: &str) -> Result<String, String> {
    let channel: u64 = channel_id.parse().unwrap();
    match get_messages(channel).await {
        Ok(data) => Ok(serde_json::to_string(&data).unwrap()),
        Err(_) => Err(String::from("Couldn't get messages")),
    }
}
