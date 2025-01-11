import type { Event } from "@tauri-apps/api/event";
import { useAppStore } from "../../../stores/app";
import type { IMessage } from "../../../types/types";

// For now
export interface MessagePayload {
	message: IMessage;
}

interface MessageUpdatePayload {
	event: IMessage;
	old?: IMessage;
	new?: IMessage;
}

export function handleDiscordMessage(ev: Event<unknown>): void {
	const payload = ev.payload as MessagePayload;
	const message = payload.message;

	if (message.channel_id === useAppStore().data.currentChannelId) {
		useAppStore().data.messages.push(message);
	} else {
		(useAppStore().data.unreadChannels as string[]).push(message.channel_id);
	}
	useAppStore().cache.cachedMessages[message.channel_id].push(message);
}

export function handleDiscordMessageUpdate(ev: Event<unknown>): void {
	const payload = ev.payload as MessageUpdatePayload;

	if (payload.event.channel_id === useAppStore().data.currentChannelId) {
		const messageId = payload.event.id;
		const messages = useAppStore().data.messages;
		const index = messages.findIndex((message) => message.id === messageId);

		if (index !== -1) {
			// TODO: Add version history
			messages[index].content = payload.event.content;
			messages[index].embeds = payload.event.embeds;
			messages[index].components = payload.event.components;
			messages[index].edited_timestamp = payload.event.edited_timestamp;
		}
	}
}

export function handleDiscordMessageDelete(ev: Event<unknown>): void {
	const payload = ev.payload as MessagePayload;
	const message = payload.message;

	const messageId = payload["message-id"];
	const index = useAppStore().data.messages.findIndex(
		(message) => message.id === messageId,
	);

	if (index !== -1) {
		useAppStore().data.messages[index].deleted = true;
	}
}
