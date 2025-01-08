import type { Event } from "@tauri-apps/api/event";
import { useAppStore } from "../../../stores/app";
import type { MessagePayload } from "./messages";

export interface ReactionPayload {
	message_id: string;
	channel_id: string;
	user_id: string;
	count: number;
	emoji: { name: string; id: string } | string;
}

export function handleDiscordReactionAdd(ev: Event<unknown>): void {
	const payload = ev.payload as ReactionPayload;

	// If the message is in the current channel
	if (payload.channel_id === useAppStore().data.currentChannelId) {
		const messageId = payload.message_id;
		const messages = useAppStore().data.messages as MessagePayload[];

		// Find the message containing the reaction
		const index = messages.findIndex((message) => message.id === messageId);

		if (index !== -1) {
			// Check if the reaction already exists
			const existingReactionIndex = messages[index].reactions.findIndex(
				(reaction) =>
					reaction.count > 0 &&
					((typeof reaction.emoji === "object" &&
						typeof payload.emoji === "object" &&
						reaction.emoji.name === payload.emoji.name) ||
						reaction.emoji === payload.emoji),
			);

			// If the reaction doesn't exist, add it
			if (existingReactionIndex === -1) {
				messages[index].reactions.push({ ...payload, count: 1 });
			} else {
				// If the reaction exists, increment the counter
				messages[index].reactions[existingReactionIndex].count += 1;
			}
		}
	}
}

export function handleDiscordReactionRemove(ev: Event<unknown>): void {
	const payload = ev.payload as ReactionPayload;

	// If the message is in the current channel
	if (payload.channel_id === useAppStore().data.currentChannelId) {
		const messageId = payload.message_id;
		const messages = useAppStore().data.messages as MessagePayload[];

		// Find the message containing the reaction
		const index = messages.findIndex((message) => message.id === messageId);

		if (index !== -1) {
			// Check if the reaction already exists
			const existingReactionIndex = messages[index].reactions.findIndex(
				(reaction) =>
					reaction.count > 0 &&
					((typeof reaction.emoji === "object" &&
						typeof payload.emoji === "object" &&
						reaction.emoji.name === payload.emoji.name) ||
						reaction.emoji === payload.emoji),
			);

			if (existingReactionIndex !== -1) {
				// If the reaction exists, decrement the counter
				messages[index].reactions[existingReactionIndex].count -= 1;

				// If the counter is 0, remove the reaction
				if (messages[index].reactions[existingReactionIndex].count <= 0) {
					messages[index].reactions.splice(existingReactionIndex, 1);
				}
			}
		}
	}
}
