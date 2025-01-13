import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "../../stores/app";
import { appRouter } from "../../main";
import { getMessages } from "./messages";
import { getGuildInfo } from "./guilds";
import { getGuildMembers } from "./members";
import type { IChannel } from "../../types/types";
import { formatLog, textToHexColor } from "../../utils/color";

/**
 * Fetches the channels for a specified guild.
 *
 * This function updates the application state with the retrieved channels
 * and caches them for future reference. It sets the loading state while
 * the request is in progress and logs any errors encountered during the
 * fetch operation.
 *
 * @param {string} guildId - The unique identifier of the guild for which channels are to be retrieved.
 * @returns {Promise<void>}
 */
export async function getChannels(guildId: string) {
	useAppStore().buffer.loadingChannels = true;
	useAppStore().layout.isInDirectMessages = false;

	const logHead = formatLog(
		"API",
		"#64ff35",
		"getChannels",
		textToHexColor("getChannels"),
	);

	invoke("get_discord_channels", { guildId })
		.then((data) => {
			const channels = data as IChannel[];

			useAppStore().data.channels = channels;
			useAppStore().cache.cachedChannels[guildId] = channels;

			console.log(...logHead, "Recieved channels", channels);
		})
		.catch((err) => {
			console.error(...logHead, "Error getting channels", err);
		})
		.finally(() => {
			useAppStore().buffer.loadingChannels = false;
		});
}

/**
 * Fetches detailed information about a specific channel.
 *
 * This function retrieves the channel information for the provided channel ID
 * and updates the application state with the current channel data. It also
 * handles the loading state and logs the process and any errors encountered
 * during the fetch operation.
 *
 * @param {string} channelId - The ChannelId of the channel to be retrieved.
 * @returns {Promise<IChannel>} - A promise that resolves to the channel information.
 */
export async function getChannelInfo(channelId: string) {
	useAppStore().buffer.loadingChannelInfo = true;

	const logHead = formatLog(
		"API",
		"#64ff35",
		"getChannelInfo",
		textToHexColor("getChannelInfo"),
	);

	try {
		const data = await invoke("get_discord_channel_info", { channelId });
		const channelInfo = data as IChannel;

		useAppStore().data.currentChannel = channelInfo;

		console.log(...logHead, "Recieved channel info", channelInfo);
		return channelInfo;
	} catch (err) {
		console.error(...logHead, "Error getting channel info", err);
	} finally {
		useAppStore().buffer.loadingChannelInfo = false;
	}
}

/**
 * Fetches the direct message channels for the current user.
 *
 * This function retrieves the direct message channels and updates the state
 * with the retrieved data.. Any errors encountered during the fetch operation are logged.
 *
 * (DMs not properly implemented yet)
 *
 * @returns {Promise<void>}
 */
export async function getDms() {
	useAppStore().buffer.loadingChannels = true;
	useAppStore().layout.isInDirectMessages = true;

	const logHead = formatLog(
		"API",
		"#64ff35",
		"getDms",
		textToHexColor("getDms"),
	);

	invoke("get_discord_direct_channels")
		.then((data) => {
			const channels = data as IChannel[];
			console.log(...logHead, "Received channels", channels);

			useAppStore().data.channels = channels;
			useAppStore().data.currentServer = null;
			useAppStore().data.currentServerId = "dms";
		})
		.catch((err) => {
			console.error(...logHead, "Error getting channels", err);
		})
		.finally(() => {
			useAppStore().buffer.loadingChannels = false;
		});
}

/**
 * Fetches the forum channels for the specified channel ID.
 *
 * This function retrieves the forum channels for the specified channel ID and updates the state
 * with the retrieved data. Any errors encountered during the fetch operation are logged.
 *
 * @param {string} channelId - The ID of the forum channel to be retrieved.
 * @returns {Promise<void>}
 */
export async function getForums(channelId: string) {
	// using loadingMessages for now; TODO: fix getForums using loadingMessages buffer
	useAppStore().buffer.loadingMessages = true;

	const logHead = formatLog(
		"API",
		"#64ff35",
		"getForums",
		textToHexColor("getForums"),
	);

	invoke("discord_get_forum_channels", {
		channelId,
		guildId: useAppStore().data.currentServerId,
	})
		.then((data) => {
			const forums = data as IChannel[];

			useAppStore().data.forums = forums;
			useAppStore().cache.cachedForums[channelId] = forums;
			useAppStore().data.channelHistory.push(channelId);

			console.log(...logHead, "Received forums", forums);
		})
		.catch((err) => {
			console.error(...logHead, "Error getting forums", err);
		})
		.finally(() => {
			useAppStore().buffer.loadingMessages = false;
		});
}

/**
 * Loads a channel by ID.
 *
 * This function determines the type of channel and
 * loads the correct type of content. If the channel is a forum,
 * it loads the forum channels. Otherwise, it loads the messages
 * in the channel.
 *
 * @param {IChannel} channel - The channel to load.
 * @returns {Promise<void>}
 */
export async function loadChannel(channel: IChannel) {
	const logHead = formatLog(
		"API",
		"#64ff35",
		"loadChannel",
		textToHexColor("loadChannel"),
	);

	console.log(...logHead, "Loading channel", channel.type, "#", channel.id);
	switch (channel.type) {
		// Category (ignored)
		case 4: {
			break;
		}

		// Forum
		case 15: {
			if (useAppStore().buffer.loadingChannels) return;
			if (useAppStore().buffer.loadingMessages) return;

			useAppStore().data.currentChannel = channel;
			useAppStore().data.currentChannelId = channel.id;

			appRouter.push(
				`/forum/${useAppStore().data.currentServerId}/${channel.id}`,
			);
			getForums(channel.id).catch((err) => {
				console.error(...logHead, "Error getting forums", err);
			});
			break;
		}

		// Text, ForumThread, Thread, News, VoiceChat, ...
		default: {
			if (useAppStore().buffer.loadingMessages) return;

			useAppStore().data.currentChannel = channel;
			useAppStore().data.currentChannelId = channel.id;
			useAppStore().data.messages = JSON.parse(
				JSON.stringify(useAppStore().cache.cachedMessages[channel.id] || []),
			);

			appRouter.push(
				`/server/${useAppStore().data.currentServerId}/${channel.id}`,
			);
			getMessages(channel.id).catch((err) => {
				console.error(...logHead, "Error getting messages", err);
			});
			break;
		}
	}
}

/**
 * Loads a channel, guild and members from its ID
 * @param {string} channelId The ID of the channel to load
 * @returns {Promise<void>}
 */
export async function loadFromChannelId(
	channelId: string,
	skipChatPage = false,
) {
	const logHead = formatLog(
		"API",
		"#64ff35",
		"loadFromChannelId",
		textToHexColor("loadFromChannelId"),
	);

	try {
		const channel = await getChannelInfo(channelId);
		if (!channel) return;

		if (channel?.guild_id) {
			await getGuildInfo(channel.guild_id);
			await getChannels(channel.guild_id);
			await getGuildMembers(channel.guild_id);
		}
		if (!skipChatPage) {
			await loadChannel(channel);
		}
	} catch (err) {
		console.error(...logHead, "Error while loading channel", channelId, err);
	}
}

/**
 * Tries to create a new channel in the specified guild.
 * @param {string} guildId The ID of the guild where the channel is to be created
 * @param {IChannel} data The data for the new channel
 * @returns {Promise<string>} A promise that resolves with an empty string if the call was successful, or a string containing the error if the call failed
 */
export async function tryCreateChannel(guildId: string, data: IChannel) {
	let errors = "";
	useAppStore().buffer.editingChannel = true;

	const logHead = formatLog(
		"API",
		"#64ff35",
		"tryCreateChannel",
		textToHexColor("tryCreateChannel"),
	);

	const params = {
		guildId,
		data,
	};

	console.log(...logHead, "Creating channel", params);
	try {
		const response = await invoke("create_discord_channel", params);
		console.log(...logHead, "Received response", response);
	} catch (e) {
		console.error(...logHead, "Error", e);
		errors += e;
	} finally {
		useAppStore().buffer.editingChannel = false;
	}
	return errors;
}

/**
 * Tries to edit a channel.
 * @param {string} channelId The ID of the channel to edit
 * @param {IChannel} data The data to edit the channel with
 * @returns {Promise<string>} A promise that resolves with an empty string if the call was successful, or a string containing the error if the call failed
 */
export async function tryEditChannel(channelId: string, data: IChannel) {
	let errors = "";
	useAppStore().buffer.editingChannel = true;

	const logHead = formatLog(
		"API",
		"#64ff35",
		"tryEditChannel",
		textToHexColor("tryEditChannel"),
	);

	const params = {
		channelId,
		data,
	};

	console.log(...logHead, "Editing channel", params);
	try {
		const response = await invoke("edit_discord_channel", params);
		console.log(...logHead, "Received response", response);
	} catch (e) {
		console.error(...logHead, "Error", e);
		errors += e;
	} finally {
		useAppStore().buffer.editingChannel = false;
	}
	return errors;
}
