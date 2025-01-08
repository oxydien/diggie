import type { Event } from "@tauri-apps/api/event";
import { useAppStore } from "../../../stores/app";
import type { ReactionPayload } from "./reactions";

// For now
export interface MessagePayload {
	id: string;
	guild_id: string;
	channel_id: string;
	author_id: string;
	content: string;
	timestamp: string;
	attachments: object[];
	embeds: object[];
	reactions: ReactionPayload[];
	mentions: string[];
	type: number;
	components: object[];
	edited_timestamp?: string;

	// diggie only
	deleted?: boolean;
}

interface MessageUpdatePayload {
	event: MessagePayload;
	old?: MessagePayload;
	new?: MessagePayload;
}

export function handleDiscordMessage(ev: Event<unknown>): void {
	const payload = ev.payload as MessagePayload;
	if (payload.channel_id === useAppStore().data.currentChannelId) {
		(useAppStore().data.messages as MessagePayload[]).push(payload);
	} else {
		(useAppStore().data.unreadChannels as string[]).push(payload.channel_id);
	}
	useAppStore().cache.cachedChannels[payload.channel_id].push(payload);
}

export function handleDiscordMessageUpdate(ev: Event<unknown>): void {
	const payload = ev.payload as MessageUpdatePayload;
	if (payload.event.channel_id === useAppStore().data.currentChannelId) {
		const messageId = payload.event.id;
		const messages = useAppStore().data.messages as MessagePayload[];
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
	const messageId = payload["message-id"];
	const index = (useAppStore().data.messages as MessagePayload[]).findIndex(
		(message) => message.id === messageId,
	);

	if (index !== -1) {
		(useAppStore().data.messages as MessagePayload[])[index].deleted = true;
	}
}
