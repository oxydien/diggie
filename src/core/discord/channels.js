import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "../../stores/app";
import { appRouter } from "../../main";
import { getMessages } from "./messages";

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
	invoke("get_discord_direct_channels")
		.then((data) => {
			console.log("[get_discord_direct_channels]", data);
			useAppStore().data.channels = JSON.parse(data);
			useAppStore().data.currentServer = {};
			useAppStore().data.currentServerId = "dms";
		})
		.catch((err) => {
			console.error("[get_discord_direct_channels]", err);
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
			useAppStore().data.channelHistory.push(channelId);
			console.log("[dis-api|getForums]", json);
		})
		.catch((err) => {
			console.error("[dis-api|getForums]", err);
		})
		.finally(() => {
			useAppStore().buffer.loadingMessages = false;
		});
}

export async function loadChannel(channel) {
	console.log("Loading channel", channel.type, channel.id);
	switch (channel.type) {
		// Category
		case 4: {
			break;
		}

		// Forum
		case 15: {
			if (useAppStore().buffer.loadingChannels) return;
			useAppStore().data.currentChannel = channel;
			useAppStore().data.currentChannelId = channel.id;
			appRouter.push(
				`/forum/${useAppStore().data.currentServerId}/${channel.id}`,
			);
			getForums(channel.id);
			break;
		}

		// Text
		default: {
			if (useAppStore().buffer.loadingMessages) return;
			useAppStore().data.currentChannel = channel;
			useAppStore().data.currentChannelId = channel.id;
			useAppStore().data.messages =
				useAppStore().cache.cachedMessages[channel.id] || [];
			appRouter.push(
				`/server/${useAppStore().data.currentServerId}/${channel.id}`,
			);
			getMessages(channel.id);
			break;
		}
	}
}
