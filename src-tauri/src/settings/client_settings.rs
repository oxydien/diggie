use super::get_app_files_path;

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ClientSettings {
    #[serde(default)]
    pub render_videos: bool,
    #[serde(default)]
    pub favorite_emojis: String,
}

impl ClientSettings {
    pub async fn load() -> Result<ClientSettings, anyhow::Error> {
        let path = get_app_files_path().await.join("client_settings.json");
        if path.exists() {
            let content = tokio::fs::read_to_string(path).await?;
            Self::from_str(&content)
        } else {
            let settings = ClientSettings::default();
            settings.save().await?;
            Ok(settings)
        }
    }
    pub fn from_str(data: &str) -> Result<ClientSettings, anyhow::Error> {
        serde_json::from_str(data).map_err(|e| e.into())
    }
    pub async fn save(&self) -> Result<(), anyhow::Error> {
        let path = get_app_files_path().await.join("client_settings.json");
        let content = serde_json::to_string(self)?;
        tokio::fs::write(path, content).await.map_err(|e| e.into())
    }
}

impl Default for ClientSettings {
    fn default() -> Self {
        ClientSettings {
            render_videos: true,
            favorite_emojis: "🤣🦭✅❌".into()
        }
    }
}
