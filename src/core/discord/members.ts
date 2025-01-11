import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "../../stores/app";
import { formatLog, textToHexColor } from "../../utils/color";
import type { IMember } from "../../types/types";

export async function getGuildMembers(guildId: string) {
	useAppStore().buffer.loadingMembers = true;

	const logHead = formatLog(
		"API",
		"#64ff35",
		"getGuildMembers",
		textToHexColor("getGuildMembers"),
	);

	invoke("get_discord_guild_members", { guildId })
		.then((data) => {
			const members = data as IMember[];
			useAppStore().data.members = members;
			console.log(...logHead, "Received guild members", members);
		})
		.catch((err) => {
			console.error(...logHead, "Error fetching guild members", err);
		})
		.finally(() => {
			useAppStore().buffer.loadingMembers = false;
		});
}
