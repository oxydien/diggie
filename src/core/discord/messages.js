import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "../../stores/app";

export async function getMessages(channelId) {
	useAppStore().buffer.loadingMessages = true;
	useAppStore().data.messages = [];
	invoke("get_discord_messages", { channelId })
		.then((data) => {
			const json = JSON.parse(data);
			useAppStore().data.messages = json;
			useAppStore().cache.cachedMessages[channelId] = json;
			useAppStore().data.channelHistory.push(channelId);
			console.log("[dis-api|getMessages]", json);
		})
		.catch((err) => {
			console.error("[dis-api|getMessages]", err);
		})
		.finally(() => {
			useAppStore().buffer.loadingMessages = false;
		});
}

export async function sendRawMessage(channelId, content) {
	useAppStore().buffer.sendingMessage = true;
	const data = {
		channelId: channelId,
		content: content,
	};
	console.log("Sending raw message", data);
	invoke("send_raw_discord_message", data)
		.then((response) => {
			console.log("[send_raw_discord_message]", response);
		})
		.catch((err) => {
			console.error("[send_raw_discord_message]", err);
		})
		.finally(() => {
			useAppStore().buffer.sendingMessage = false;
		});
}

export async function sendRawReplyMessage(channelId, messageId, data) {
	useAppStore().buffer.sendingMessage = true;
	const request = {
		channelId: channelId,
		messageId: messageId,
		data: data,
	};
	console.log("Sending raw reply message", request);
	invoke("discord_raw_reply", request)
		.then((data) => {
			console.log("[discord_raw_reply]", data);
			useAppStore().data.textInput.replyingTo = null;
		})
		.catch((err) => {
			console.error("[discord_raw_reply]", err);
		})
		.finally(() => {
			useAppStore().buffer.sendingMessage = false;
		});
}

export async function sendRawEditMessage(channelId, messageId, data) {
	useAppStore().buffer.sendingMessage = true;
	const request = {
		channelId: channelId,
		messageId: messageId,
		data: data,
	};

	console.log("Sending raw edit message", request);
	invoke("discord_raw_edit", request)
		.then((data) => {
			console.log("[discord_raw_edit]", data);
			useAppStore().data.textInput.editing = null;
		})
		.catch((err) => {
			console.error("[discord_raw_edit]", err);
		})
		.finally(() => {
			useAppStore().buffer.sendingMessage = false;
		});
}

// Reactions

export async function tryAddReaction(channelId, messageId, unicode) {
	const request = {
		channelId: channelId,
		messageId: messageId,
		emoji: unicode,
	};
	console.log("Adding reaction", request);
	invoke("discord_create_reaction", request)
		.then((data) => {
			console.log("[discord_create_reaction] success", data);
		})
		.catch((err) => {
			console.error("[discord_create_reaction] failed", err);
		});
}

export async function tryRemoveReaction(channelId, messageId, unicode) {
	const request = {
		channelId: channelId,
		messageId: messageId,
		emoji: unicode,
	};
	console.log("Removing reaction", request);
	invoke("discord_delete_reaction", request)
		.then((data) => {
			console.log("[discord_delete_reaction] success", data);
		})
		.catch((err) => {
			console.error("[discord_delete_reaction] failed", err);
		});
}
