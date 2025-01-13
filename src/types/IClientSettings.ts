export default interface IClientSettings {
	render_videos?: boolean;
	favorite_emojis?: string;
	// All other can be found in /src-tauri/settings/client_settings.rs
	[key: string]: string;
}
