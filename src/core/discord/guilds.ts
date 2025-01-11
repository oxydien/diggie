import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "../../stores/app";
import { formatLog, textToHexColor } from "../../utils/color";
import type { IGuild } from "../../types/types";

/**
 * Fetches the guilds the user is in.
 *
 * This function sets the loading state while the request is in progress,
 * updates the application state with the retrieved guilds, and logs any errors
 * encountered during the fetch operation.
 */
export async function getGuilds() {
	useAppStore().buffer.loadingGuilds = true;

	const logHead = formatLog(
		"API",
		"#64ff35",
		"getGuilds",
		textToHexColor("getGuilds"),
	);

	invoke("get_discord_guilds")
		.then((data) => {
			const guilds = data as IGuild[];
			useAppStore().data.guilds = guilds;
			console.log(...logHead, "Received guilds", guilds);
		})
		.catch((err) => {
			console.error(...logHead, "Error fetching guilds", err);
		})
		.finally(() => {
			useAppStore().buffer.loadingGuilds = false;
		});
}

/**
 * Fetches information about a specific guild.
 *
 * This function sets the loading state while the request is in progress,
 * updates the application state with the retrieved guild information,
 * and logs any errors encountered during the fetch operation.
 *
 * @param {string} guildId - The GuildId of the guild for which information is to be retrieved.
 * @returns {Promise<void>}
 */
export async function getGuildInfo(guildId: string) {
	useAppStore().buffer.loadingGuildInfo = true;

	const logHead = formatLog(
		"API",
		"#64ff35",
		"getGuildInfo",
		textToHexColor("getGuildInfo"),
	);

	invoke("get_discord_guild_info", { guildId })
		.then((data) => {
			const guild = data as IGuild;

			// Converts role colors to hex
			guild.roles
				.sort((a, b) => b.position - a.position)
				.map((el) => {
					el.color = el.color.toString(16).substring(0, 6) || "gray";
					return el;
				});

			useAppStore().data.currentServer = guild;

			console.log(...logHead, "Received guild info", guild);
		})
		.catch((err) => {
			console.error(...logHead, "Error fetching guild info", err);
		})
		.finally(() => {
			useAppStore().buffer.loadingGuildInfo = false;
		});
}
