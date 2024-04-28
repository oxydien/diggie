import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "../../stores/app";

export async function getGuildMembers(id) {
	useAppStore().buffer.loadingMembers = true;
	invoke("get_discord_guild_members", { guildId: id })
		.then((data) => {
			const json = JSON.parse(data);
			useAppStore().data.members = json;
			console.log("[dis-api|getGuildMembers]", json);
		})
		.catch((err) => {
			console.error("[dis-api|getGuildMembers]", err);
		})
		.finally(() => {
			useAppStore().buffer.loadingMembers = false;
		});
}
