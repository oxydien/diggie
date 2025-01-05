import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "../../stores/app";
import { appRouter } from "../../main";
import { getMessages } from "./messages";
import { getGuildInfo } from "./guilds";
import { getGuildMembers } from "./members";

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

export async function getChannelInfo(channelId) {
	useAppStore().buffer.loadingChannelInfo = true;
	try {
		const data = await invoke("get_discord_channel_info", { channelId });
		const json = JSON.parse(data);
		useAppStore().data.currentChannel = json;
		console.log("[dis-api|getChannelInfo]", json);
		return json;
	} catch (err) {
		console.error("[dis-api|getChannelInfo]", err);
	} finally {
		useAppStore().buffer.loadingChannelInfo = false;
	}
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
			getForums(channel.id).catch((err) => {
				console.error("[dis-api|loadChannel] getForums call", err);
			});
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
			getMessages(channel.id).catch((err) => {
				console.error("[dis-api|loadChannel] getMessages call", err);
			});
			break;
		}
	}
}

/**
 * Loads a channel, guild and members from its ID
 * @param {number} channelId The ID of the channel to load
 * @returns {Promise<void>}
 */
export async function loadFromChannelId(channelId, skipChatPage = false) {
	try {
		const channel = await getChannelInfo(channelId);
		if (channel.guild_id) {
			await getGuildInfo(channel.guild_id);
			await getChannels(channel.guild_id);
			await getGuildMembers(channel.guild_id);
		}
		if (!skipChatPage) {
			await loadChannel(channel);
		}
	} catch (err) {
		console.error("Error while loading channel", channelId, err);
	}
}

/**
 * Tries to create a new channel in the specified guild.
 * @param {number} guildId The ID of the guild where the channel is to be created
 * @param {Object} data The data for the new channel
 * @returns {Promise<string>} A promise that resolves with an empty string if the call was successful, or a string containing the error if the call failed
 */

export async function tryCreateChannel(guildId, data) {
	let errors = "";
	useAppStore().buffer.editingChannel = true;
	const params = {
		guildId,
		data,
	};
	console.log("[create_discord_channel] Creating channel", params);
	try {
		const response = await invoke("create_discord_channel", params);
		console.log("[create_discord_channel] response", response);
	} catch (e) {
		console.error("[create_discord_channel] Error", e);
		errors += e;
	} finally {
		useAppStore().buffer.editingChannel = false;
	}
	return errors;
}

/**
 * Tries to edit a channel.
 * @param {number} channelId The ID of the channel to edit
 * @param {Object} data The data to edit the channel with
 * @returns {Promise<string>} A promise that resolves with an empty string if the call was successful, or a string containing the error if the call failed
 */
export async function tryEditChannel(channelId, data) {
	let errors = "";
	useAppStore().buffer.editingChannel = true;
	const params = {
		channelId,
		data,
	};
	console.log("[edit_discord_channel] Editing channel", params);
	try {
		const response = await invoke("edit_discord_channel", params);
		console.log("[edit_discord_channel] response", response);
	} catch (e) {
		console.error("[edit_discord_channel] Error", e);
		errors += e;
	} finally {
		useAppStore().buffer.editingChannel = false;
	}
	return errors;
}

