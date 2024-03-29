use serenity::all::{GuildId, GuildInfo, PartialGuild};

use super::DISCORD_CONTEXT;

pub async fn get_guilds() -> Result<Vec<GuildInfo>, String> {
    let mut ctx = DISCORD_CONTEXT.lock().await;

    match ctx.as_mut().unwrap().http.get_guilds(None, Some(100)).await {
        Ok(data) => Ok(data),
        Err(_) => Err(String::from("Couldn't get guilds")),
    }
}

pub async fn get_guild_info(guild_id: u64) -> Result<PartialGuild, String> {
    let mut ctx = DISCORD_CONTEXT.lock().await;
    let guild = GuildId::new(guild_id);

    match ctx.as_mut().unwrap().http.get_guild(guild).await {
        Ok(data) => Ok(data),
        Err(_) => Err(String::from("Couldn't get guild info")),
    }
}
