import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "../../stores/app";
import { formatLog, textToHexColor } from "../../utils/color";
import type { IMessage } from "../../types/types";

/**
 * Fetches messages for a specified channel.
 *
 * This function retrieves messages for the given channel ID and updates
 * the application state with the retrieved messages. It also caches the messages
 * and logs any errors encountered during the fetch operation.
 *
 * @param {string} channelId - The ID of the channel for which messages are to be retrieved.
 * @returns {Promise<void>}
 */
export async function getMessages(channelId: string) {
	useAppStore().buffer.loadingMessages = true;
	useAppStore().data.messages = [];

	const logHead = formatLog(
		"API",
		"#64ff35",
		"getMessages",
		textToHexColor("getMessages"),
	);

	invoke("get_discord_messages", { channelId })
		.then((data) => {
			const messages = data as IMessage[];

			useAppStore().data.messages = messages;
			useAppStore().cache.cachedMessages[channelId] = [...messages];
			useAppStore().data.channelHistory.push(channelId);

			console.log(...logHead, "Received messages", messages);
		})
		.catch((err) => {
			console.error(...logHead, "Error fetching messages", err);
		})
		.finally(() => {
			useAppStore().buffer.loadingMessages = false;
		});
}

// MARK: Send Message

/**
 * Sends a raw message to specified channel.
 *
 * It logs the request and response and sets the loading state while the request is in progress.
 *
 * @param {string} channelId - The ID of the channel to send the message to.
 * @param {object} content - The content of the message to be sent.
 * @returns {Promise<void>}
 */
export async function sendRawMessage(channelId: string, content: object) {
	useAppStore().buffer.sendingMessage = true;
	const data = {
		channelId: channelId,
		content: content,
	};

	const logHead = formatLog(
		"API",
		"#64ff35",
		"sendRawMessage",
		textToHexColor("sendRawMessage"),
	);

	console.log(...logHead, "Sending raw message", data);
	invoke("send_raw_discord_message", data)
		.then((response) => {
			console.log(...logHead, "Received response", response);
		})
		.catch((err) => {
			console.error(...logHead, "Error", err);
		})
		.finally(() => {
			useAppStore().buffer.sendingMessage = false;
		});
}

/**
 * Sends a raw reply message to a specified message in a specified channel.
 *
 * It logs the request and response and sets the loading state while the request is in progress.
 *
 * @param {string} channelId - The ID of the channel to send the message to.
 * @param {string} messageId - The ID of the message to reply to.
 * @param {object} content - The content of the message to be sent.
 * @returns {Promise<void>}
 */
export async function sendRawReplyMessage(
	channelId: string,
	messageId: string,
	data: object,
) {
	useAppStore().buffer.sendingMessage = true;
	const request = {
		channelId: channelId,
		messageId: messageId,
		data: data,
	};

	const logHead = formatLog(
		"API",
		"#64ff35",
		"sendRawReplyMessage",
		textToHexColor("sendRawReplyMessage"),
	);

	console.log(...logHead, "Sending raw reply message", request);
	invoke("discord_raw_reply", request)
		.then((data) => {
			console.log(...logHead, "Received response", data);
			useAppStore().data.textInput.replyingTo = null;
		})
		.catch((err) => {
			console.error(...logHead, "Error", err);
		})
		.finally(() => {
			useAppStore().buffer.sendingMessage = false;
		});
}

/**
 * Sends a raw edit message to a specified message in a specified channel.
 *
 * This function logs the request and response, and sets the loading state while the request is in progress.
 * It resets the editing state upon successful completion.
 *
 * @param {string} channelId - The ID of the channel containing the message to be edited.
 * @param {string} messageId - The ID of the message to be edited.
 * @param {object} data - The new content of the message to be sent.
 * @returns {Promise<void>}
 */
export async function sendRawEditMessage(
	channelId: string,
	messageId: string,
	data: object,
) {
	useAppStore().buffer.sendingMessage = true;
	const request = {
		channelId: channelId,
		messageId: messageId,
		data: data,
	};

	const logHead = formatLog(
		"API",
		"#64ff35",
		"sendRawEditMessage",
		textToHexColor("sendRawEditMessage"),
	);

	console.log(...logHead, "Sending raw edit message", request);
	invoke("discord_raw_edit", request)
		.then((data) => {
			console.log(...logHead, "Received response", data);
			useAppStore().data.textInput.editing = null;
		})
		.catch((err) => {
			console.error(...logHead, "Error", err);
		})
		.finally(() => {
			useAppStore().buffer.sendingMessage = false;
		});
}

// MARK: Reactions

/**
 * Attempts to add a reaction to a specified message in a specified channel.
 *
 * This function sends a request to add a reaction using the provided channel ID,
 * message ID, and emoji. It logs the request and response, and returns any error
 * encountered during the operation.
 *
 * @param {string} channelId - The ID of the channel containing the message.
 * @param {string} messageId - The ID of the message to which the reaction is to be added.
 * @param {string} unicode - The Unicode representation of the emoji to add as a reaction.
 * @returns {Promise<string>} A promise that resolves with an error message if the operation fails, or an empty string if successful.
 */
export async function tryAddReaction(
	channelId: string,
	messageId: string,
	unicode: string,
): Promise<string> {
	let error = "";
	const request = {
		channelId: channelId,
		messageId: messageId,
		emoji: unicode,
	};

	const logHead = formatLog(
		"API",
		"#64ff35",
		"tryAddReaction",
		textToHexColor("tryAddReaction"),
	);

	console.debug(...logHead, "Adding reaction", request);
	invoke("discord_create_reaction", request)
		.then((data) => {
			console.debug(...logHead, "Successfully added reaction", data);
		})
		.catch((err) => {
			console.error(...logHead, "Failed to add reaction", err);
			error = err;
		});

	return error;
}

/**
 * Attempts to remove a reaction from a specified message in a specified channel.
 *
 * This function sends a request to remove a reaction using the provided channel ID,
 * message ID, and emoji. It logs the request and response, and returns any error
 * encountered during the operation.
 *
 * @param {string} channelId - The ID of the channel containing the message.
 * @param {string} messageId - The ID of the message from which the reaction is to be removed.
 * @param {string} unicode - The Unicode representation of the emoji to remove as a reaction.
 * @returns {Promise<string>} A promise that resolves with an error message if the operation fails, or an empty string if successful.
 */
export async function tryRemoveReaction(channelId, messageId, unicode) {
	let error = "";
	const request = {
		channelId: channelId,
		messageId: messageId,
		emoji: unicode,
	};

	const logHead = formatLog(
		"API",
		"#64ff35",
		"tryRemoveReaction",
		textToHexColor("tryRemoveReaction"),
	);

	console.debug(...logHead, "Removing reaction", request);
	invoke("discord_delete_reaction", request)
		.then((data) => {
			console.debug(...logHead, "Successfully removed reaction", data);
		})
		.catch((err) => {
			console.error(...logHead, "Failed to remove reaction", err);
			error = err;
		});

	return error;
}
