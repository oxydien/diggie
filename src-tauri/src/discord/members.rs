use serenity::all::{GuildId, Member, UserId};

use super::DISCORD_CONTEXT;

pub async fn get_members(guild_id: u64) -> Result<Vec<Member>, String> {
    let mut ctx = DISCORD_CONTEXT.lock().await;
    let guild = GuildId::new(guild_id);

    match ctx
        .as_mut()
        .unwrap()
        .http
        .get_guild_members(guild, Some(512), None)
        .await
    {
        Ok(data) => Ok(data),
        Err(_) => Err(String::from("Couldn't get guilds")),
    }
}

pub async fn get_member_info(guild_id: u64, user_id: u64) -> Result<Member, String> {
    let mut ctx = DISCORD_CONTEXT.lock().await;
    let guild = GuildId::new(guild_id);
    let user = UserId::new(user_id);

    match ctx.as_mut().unwrap().http.get_member(guild, user).await {
        Ok(data) => Ok(data),
        Err(_) => Err(String::from("Couldn't get guild info")),
    }
}
