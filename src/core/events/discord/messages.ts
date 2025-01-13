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

interface MessageDeletePayload {
	message_id: string;
	channel_id: string;
	guild_id?: string;
}

export function handleDiscordMessage(ev: Event<unknown>): void {
	const payload = ev.payload as MessagePayload;
	const message = payload.message;

	const messages = useAppStore().data.messages;
	if (message.channel_id === useAppStore().data.currentChannelId) {
		// These comments are here for my personal security (remove only if you 100% know that there is no pointers and no message duplicates occurs)
		//console.log(
		//		"Received message",
		//		message,
		//		"Last messages",
		//		messages.slice(-3).map((m) => m.content),
		//);
		messages.push(message);
	} else {
		useAppStore().data.unreadChannels.push(message.channel_id);
	}
	//console.log(
	//		"Cashing",
	//		message,
	//		"Last messages",
	//		messages.slice(-3).map((m) => m.content),
	//);
	useAppStore().cache.cachedMessages[message.channel_id].push(message);
	//console.log(
	//	"Cashed",
	//	message,
	//	"Last messages",
	//	messages.slice(-3).map((m) => m.content),
	//);
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
	const payload = ev.payload as MessageDeletePayload;

	const messageId = payload.message_id;
	const index = useAppStore().data.messages.findIndex(
		(message) => message.id === messageId,
	);

	if (index !== -1) {
		useAppStore().data.messages[index].deleted = true;
	}
}
