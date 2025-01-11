import type { Event } from "@tauri-apps/api/event";
import { useAppStore } from "../../../stores/app";
import type { IReaction } from "../../../types/types";

interface ReactionPayload {
	reaction: IReaction;
}

export function handleDiscordReactionAdd(ev: Event<unknown>): void {
	const payload = ev.payload as ReactionPayload;
	const reaction = payload.reaction;

	// If the message is in the current channel
	if (reaction.channel_id === useAppStore().data.currentChannelId) {
		const messageId = reaction.message_id;
		const messages = useAppStore().data.messages;

		// Find the message containing the reaction
		const index = messages.findIndex((message) => message.id === messageId);

		if (index !== -1) {
			// Check if the reaction already exists
			const existingReactionIndex = messages[index].reactions.findIndex(
				(existingReaction) =>
					existingReaction.count > 0 &&
					(existingReaction.emoji.name === reaction.emoji.name ||
						(existingReaction.emoji.id &&
							existingReaction.emoji.id === reaction.emoji.id)),
			);

			// If the reaction doesn't exist, add it
			if (existingReactionIndex === -1) {
				messages[index].reactions.push({ ...reaction, count: 1 });
			} else {
				// If the reaction exists, increment the counter
				messages[index].reactions[existingReactionIndex].count += 1;
			}
		}
	}
}

export function handleDiscordReactionRemove(ev: Event<unknown>): void {
	const payload = ev.payload as ReactionPayload;
	const reaction = payload.reaction;

	// If the message is in the current channel
	if (reaction.channel_id === useAppStore().data.currentChannelId) {
		const messageId = reaction.message_id;
		const messages = useAppStore().data.messages;

		// Find the message containing the reaction
		const index = messages.findIndex((message) => message.id === messageId);

		if (index !== -1) {
			// Check if the reaction already exists
			const existingReactionIndex = messages[index].reactions.findIndex(
				(existingReaction) =>
					existingReaction.count > 0 &&
					(existingReaction.emoji.name === reaction.emoji.name ||
						(existingReaction.emoji.id &&
							existingReaction.emoji.id === reaction.emoji.id)),
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
