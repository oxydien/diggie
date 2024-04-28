import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "../../stores/app";

export async function getChannels(guildId) {
	useAppStore().buffer.loadingChannels = true;
	useAppStore().layout.isInDirrectMessages = false;
	invoke("get_discord_channels", { guildId })
		.then((data) => {
			const json = JSON.parse(data);
			useAppStore().data.channels = json;
			useAppStore().cache.cachedChannels[guildId] = json;
			console.log("[dis-api|getChannels]", json);
		})
		.catch((err) => {
			console.error("[dis-api|getChannels]", err);
		})
		.finally(() => {
			useAppStore().buffer.loadingChannels = false;
		});
}

export async function getDms() {
	useAppStore().buffer.loadingChannels = true;
	useAppStore().layout.isInDirrectMessages = true;
	invoke("get_discord_dirrect_channels")
		.then((data) => {
			console.log("[get_discord_dirrect_channels]", data);
			useAppStore().data.channels = JSON.parse(data);
			useAppStore().data.currentServer = {};
			useAppStore().data.currentServerId = "dms";
		})
		.catch((err) => {
			console.error("[get_discord_dirrect_channels]", err);
		})
		.finally(() => {
			useAppStore().buffer.loadingChannels = false;
		});
}

export async function getForums(channelId) {
	useAppStore().buffer.loadingMessages = true;
	invoke("discord_get_forum_channels", {
		channelId,
		guildId: useAppStore().data.currentServerId,
	})
		.then((data) => {
			const json = JSON.parse(data);
			useAppStore().data.forums = json;
			useAppStore().cache.cachedForums[channelId] = json;
			console.log("[dis-api|getForums]", json);
		})
		.catch((err) => {
			console.error("[dis-api|getForums]", err);
		})
		.finally(() => {
			useAppStore().buffer.loadingMessages = false;
		});
}
