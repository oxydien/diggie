use serde::{Deserialize, Serialize};
use serenity::all::{
    Channel, ChannelId, ChannelType, GuildChannel, GuildId, PermissionOverwrite, PrivateChannel,
    ThreadsData,
};

use super::DISCORD_CONTEXT;

pub async fn get_channels(guild_id: u64) -> Result<Vec<GuildChannel>, String> {
    let mut ctx = DISCORD_CONTEXT.lock().await;
    let guild = GuildId::new(guild_id);

    match ctx.as_mut().unwrap().http.get_channels(guild).await {
        Ok(data) => Ok(data),
        Err(_) => Err(String::from("Couldn't get channels")),
    }
}

pub async fn get_channel_info(channel_id: u64) -> Result<Channel, String> {
    let mut ctx = DISCORD_CONTEXT.lock().await;
    let channel = ChannelId::new(channel_id);

    match ctx.as_mut().unwrap().http.get_channel(channel).await {
        Ok(data) => Ok(data),
        Err(_) => Err(String::from("Couldn't get channel info")),
    }
}

pub async fn get_direct_channels() -> Result<Vec<PrivateChannel>, String> {
    let mut ctx = DISCORD_CONTEXT.lock().await;

    match ctx.as_mut() {
        Some(ctx) => match ctx.http.get_user_dm_channels().await {
            Ok(data) => Ok(data),
            Err(_) => Err(String::from("Couldn't get channels")),
        },
        None => Err(String::from("No context found")),
    }
}

pub async fn get_forum_channels(guild_id: u64, channel_id: u64) -> Result<ThreadsData, String> {
    let mut ctx = DISCORD_CONTEXT.lock().await;
    let channel = ChannelId::new(channel_id);
    let guild = GuildId::new(guild_id);

    let all_active_threads = match ctx
        .as_mut()
        .unwrap()
        .http
        .get_guild_active_threads(guild)
        .await
    {
        Ok(val) => val.threads,
        Err(_) => vec![],
    };

    let filtered_threads: Vec<GuildChannel> = all_active_threads
        .into_iter()
        .filter(|thread| thread.parent_id == Some(channel))
        .collect();

    match ctx
        .as_mut()
        .unwrap()
        .http
        .get_channel_archived_public_threads(channel, None, None)
        .await
    {
        Ok(mut data) => {
            let mut combined_threads = data.threads;
            combined_threads.extend(filtered_threads);
            data.threads = combined_threads;
            Ok(data)
        }
        Err(e) => Err(format!("Couldn't get channels {:?}", e)),
    }
}

#[derive(Serialize, Deserialize)]
pub struct EditableChannel {
    name: String,
    r#type: ChannelType,
    position: Option<u16>,
    topic: Option<String>,
    nsfw: Option<bool>,
    rate_limit_per_user: Option<u32>,
    bitrate: Option<u16>,
    user_limit: Option<u8>,
    permission_overwrites: Option<Vec<PermissionOverwrite>>,
    parent_id: Option<ChannelId>,
}

pub async fn create_channel(guild_id: u64, map: EditableChannel) -> Result<GuildChannel, String> {
    let mut ctx = DISCORD_CONTEXT.lock().await;
    let guild = GuildId::new(guild_id);

    match ctx
        .as_mut()
        .unwrap()
        .http
        .create_channel(guild, &map, Some("diggie created channel"))
        .await
    {
        Ok(data) => Ok(data),
        Err(err) => Err(format!("Couldn't create channel {:?}", err)),
    }
}

pub async fn edit_channel(channel_id: u64, map: EditableChannel) -> Result<GuildChannel, String> {
    let mut ctx = DISCORD_CONTEXT.lock().await;
    let channel = ChannelId::new(channel_id);

    match ctx
        .as_mut()
        .unwrap()
        .http
        .edit_channel(channel, &map, Some("diggie edited channel"))
        .await
    {
        Ok(data) => Ok(data),
        Err(err) => Err(format!("Couldn't edit channel {:?}", err)),
    }
}

pub async fn delete_channel(channel_id: u64) -> Result<Channel, String> {
    let mut ctx = DISCORD_CONTEXT.lock().await;
    let channel = ChannelId::new(channel_id);

    match ctx
        .as_mut()
        .unwrap()
        .http
        .delete_channel(channel, Some("diggie deleted channel"))
        .await
    {
        Ok(data) => Ok(data),
        Err(err) => Err(format!("Couldn't delete channel {:?}", err)),
    }
}
