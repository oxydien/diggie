use serenity::all::{ChannelId, GuildChannel, GuildId, PrivateChannel, ThreadsData};

use super::DISCORD_CONTEXT;

pub async fn get_channels(guild_id: u64) -> Result<Vec<GuildChannel>, String> {
    let mut ctx = DISCORD_CONTEXT.lock().await;
    let guild = GuildId::new(guild_id);

    match ctx.as_mut().unwrap().http.get_channels(guild).await {
        Ok(data) => Ok(data),
        Err(_) => Err(String::from("Couldn't get channels")),
    }
}

pub async fn get_dirrect_channels() -> Result<Vec<PrivateChannel>, String> {
    let mut ctx = DISCORD_CONTEXT.lock().await;

    match ctx.as_mut().unwrap().http.get_user_dm_channels().await {
        Ok(data) => Ok(data),
        Err(_) => Err(String::from("Couldn't get channels")),
    }
}

pub async fn get_forum_channels(channel_id: u64) -> Result<ThreadsData, String> {
    let mut ctx = DISCORD_CONTEXT.lock().await;
    let channel = ChannelId::new(channel_id);

    match ctx
        .as_mut()
        .unwrap()
        .http
        .get_channel_archived_public_threads(channel, None, None)
        .await
    {
        Ok(data) => Ok(data),
        Err(_) => Err(String::from("Couldn't get channels")),
    }
}
