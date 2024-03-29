use serenity::all::{ChannelId, MessageId, ReactionType};

use super::DISCORD_CONTEXT;

pub async fn add_reaction(channel_id: u64, message_id: u64, reaction: &str) -> Result<(), String> {
    let channel = ChannelId::new(channel_id);
    let message = MessageId::new(message_id);
    let mut ctx = DISCORD_CONTEXT.lock().await;
    let reaction_type = ReactionType::Unicode(reaction.to_owned());

    match ctx
        .as_mut()
        .unwrap()
        .http
        .create_reaction(channel, message, &reaction_type)
        .await
    {
        Ok(_) => Ok(()),
        Err(_) => Err(String::from("Could not create reaction")),
    }
}

pub async fn remove_reaction(
    channel_id: u64,
    message_id: u64,
    reaction: &str,
) -> Result<(), String> {
    let channel = ChannelId::new(channel_id);
    let message = MessageId::new(message_id);
    let mut ctx = DISCORD_CONTEXT.lock().await;
    let reaction_type = ReactionType::Unicode(reaction.to_owned());

    match ctx
        .as_mut()
        .unwrap()
        .http
        .delete_reaction_me(channel, message, &reaction_type)
        .await
    {
        Ok(_) => Ok(()),
        Err(_) => Err(String::from("Could not delete reaction")),
    }
}
