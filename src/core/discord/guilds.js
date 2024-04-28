import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "../../stores/app";

export async function getGuilds() {
	useAppStore().buffer.loadingGuilds = true;
	invoke("get_discord_guilds")
		.then((data) => {
			const json = JSON.parse(data);
			useAppStore().data.guilds = json;
			console.log("[dis-api|getGuilds]", json);
		})
		.catch((err) => {
			console.error("[dis-api|getGuilds]", err);
		})
		.finally(() => {
			useAppStore().buffer.loadingGuilds = false;
		});
}

export async function getGuildInfo(id) {
	useAppStore().buffer.loadingGuildInfo = true;
	invoke("get_discord_guild_info", { guildId: id })
		.then((data) => {
			const json = JSON.parse(data);
			json.roles
				.sort((a, b) => b.position - a.position)
				.map((el) => {
					el.color = el.color.toString(16).substring(0, 6) || "gray";
					return el;
				});
			useAppStore().data.currentServer = json;
			console.log("[dis-api|getGuildInfo]", json);
		})
		.catch((err) => {
			console.error("[dis-api|getGuildInfo]", err);
		})
		.finally(() => {
			useAppStore().buffer.loadingGuildInfo = false;
		});
}
