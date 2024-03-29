use serde::{Deserialize, Serialize};
use serenity::all::{ChannelId, Message, MessageId};

use super::DISCORD_CONTEXT;

#[derive(Debug, Serialize, Deserialize)]
struct EmbedAuthor {
    name: Option<String>,
    url: Option<String>,
    icon_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct EmbedField {
    name: String,
    value: String,
    inline: bool,
}

#[derive(Debug, Serialize, Deserialize)]
struct EmbedFooter {
    text: String,
    icon_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct EmbedImage {
    url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct EmbedThumbnail {
    url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct EmbedVideo {
    url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct EmbedProvider {
    name: Option<String>,
    url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct DiscordEmbed {
    title: Option<String>,
    description: Option<String>,
    url: Option<String>,
    timestamp: Option<String>,
    color: Option<u32>,
    footer: Option<EmbedFooter>,
    image: Option<EmbedImage>,
    thumbnail: Option<EmbedThumbnail>,
    video: Option<EmbedVideo>,
    provider: Option<EmbedProvider>,
    author: Option<EmbedAuthor>,
    fields: Option<Vec<EmbedField>>,
}

#[derive(Debug, Serialize, Deserialize)]
struct DiscordMessage {
    content: String,
    embeds: Option<Vec<DiscordEmbed>>,
}

#[derive(Serialize)]
struct MessageContent {
    content: String,
}

pub async fn send_message(channel_id: u64, data: &str) -> Result<(), String> {
    let channel = ChannelId::new(channel_id);
    let mut ctx = DISCORD_CONTEXT.lock().await;

    let message_content = MessageContent {
        content: data.to_string(),
    };

    match ctx
        .as_mut()
        .unwrap()
        .http
        .send_message(channel, vec![], &message_content)
        .await
    {
        Ok(_) => Ok(()),
        Err(err) => Err(format!("Couldn't send message: {:?}", err)),
    }
}

pub async fn send_raw_message(channel_id: u64, data: &str) -> Result<(), String> {
    let channel = ChannelId::new(channel_id);
    let mut ctx = DISCORD_CONTEXT.lock().await;

    // Deserialize the input JSON string into a serde_json::Value
    let raw_json: DiscordMessage = serde_json::from_str(data).unwrap();

    match ctx
        .as_mut()
        .unwrap()
        .http
        .send_message(channel, vec![], &raw_json)
        .await
    {
        Ok(_) => Ok(()),
        Err(err) => Err(format!("Couldn't send raw message: {:?}", err)),
    }
}

pub async fn reply_to_message(channel_id: u64, message_id: u64, data: &str) -> Result<(), String> {
    let channel = ChannelId::new(channel_id);
    let message = MessageId::new(message_id);
    let mut ctx = DISCORD_CONTEXT.lock().await;

    let found_message = match ctx
        .as_mut()
        .unwrap()
        .http
        .get_message(channel, message)
        .await
    {
        Ok(data) => data,
        Err(_) => return Err(String::from("Could not find message specified")),
    };

    // Deserialize the input JSON string into a serde_json::Value
    let raw_json: DiscordMessage = serde_json::from_str(data).unwrap();

    match found_message
        .reply(&ctx.as_mut().unwrap().http, &raw_json.content)
        .await
    {
        Ok(_) => Ok(()),
        Err(err) => Err(format!("Couldn't send raw reply message: {:?}", err)),
    }
}

pub async fn edit_message(channel_id: u64, message_id: u64, data: &str) -> Result<Message, String> {
    let channel = ChannelId::new(channel_id);
    let message = MessageId::new(message_id);
    let mut ctx = DISCORD_CONTEXT.lock().await;

    let raw_json: DiscordMessage = serde_json::from_str(data).unwrap();
    match ctx
        .as_mut()
        .unwrap()
        .http
        .edit_message(channel, message, &raw_json, vec![])
        .await
    {
        Ok(data) => Ok(data),
        Err(_) => Err(String::from("Could not find message specified")),
    }
}

pub async fn delete_message(channel_id: u64, message_id: u64) -> Result<(), String> {
    let channel = ChannelId::new(channel_id);
    let message = MessageId::new(message_id);
    let mut ctx = DISCORD_CONTEXT.lock().await;

    match ctx
        .as_mut()
        .unwrap()
        .http
        .delete_message(channel, message, None)
        .await
    {
        Ok(_) => Ok(()),
        Err(err) => Err(err.to_string()),
    }
}

pub async fn get_messages(channel_id: u64) -> Result<Vec<Message>, String> {
    let mut ctx = DISCORD_CONTEXT.lock().await;
    let guild = ChannelId::new(channel_id);

    match ctx
        .as_mut()
        .unwrap()
        .http
        .get_messages(guild, None, Some(100))
        .await
    {
        Ok(data) => Ok(data),
        Err(_) => Err(String::from("Couldn't get channels")),
    }
}
