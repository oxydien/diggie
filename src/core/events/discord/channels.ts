import type { Event } from "@tauri-apps/api/event";
import { useAppStore } from "../../../stores/app";

interface ChannelPayload {
	id: string;
	name: string;
	type: number;
	guild_id: string;
	position: number;
	parent_id: string;
	last_message_id: string;
	topic: string;
	nsfw: boolean;
}

interface ChannelUpdatePayload {
	old: ChannelPayload | null;
	new: ChannelPayload;
}

export function handleDiscordCreateChannel(ev: Event<unknown>): void {
	const payload = ev.payload as ChannelPayload;
	if (useAppStore().data.currentServerId === payload.guild_id) {
		// @ts-ignore: Type 'ChannelPayload' is not assignable to type 'never'
		// app-store in js
		useAppStore().data.channels.push(payload);
	}
}

export function handleDiscordChannelUpdate(ev: Event<unknown>): void {
	const payload = ev.payload as ChannelUpdatePayload;

	const targetChannel = (
		useAppStore().data.channels as ChannelPayload[]
	).findIndex((channel) => channel.id === payload.new.id);
	if (targetChannel >= 0) {
		(useAppStore().data.channels as ChannelPayload[])[targetChannel] =
			payload.new;
	}
}

export function handleDiscordDeleteChannel(ev: Event<unknown>): void {
	const payload = ev.payload as ChannelPayload;
	const channel = (useAppStore().data.channels as ChannelPayload[]).findIndex(
		(channel) => channel.id === payload.id,
	);
	if (channel >= 0) {
		useAppStore().data.channels.splice(channel, 1);
	}
}
