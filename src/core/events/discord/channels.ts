import type { Event } from "@tauri-apps/api/event";
import { useAppStore } from "../../../stores/app";
import type { IChannel } from "../../../types/types";

interface ChannelPayload {
	channel: IChannel;
}

interface ChannelUpdatePayload {
	old: IChannel | null;
	new: IChannel;
}

export function handleDiscordCreateChannel(ev: Event<unknown>): void {
	const payload = ev.payload as ChannelPayload;
	if (useAppStore().data.currentServerId === payload.channel.guild_id) {
		// @ts-ignore: Type 'ChannelPayload' is not assignable to type 'never'
		// app-store in js
		useAppStore().data.channels.push(payload);
	}
}

export function handleDiscordChannelUpdate(ev: Event<unknown>): void {
	const payload = ev.payload as ChannelUpdatePayload;

	const targetChannel = (
		useAppStore().data.channels
	).findIndex((channel) => channel.id === payload.new.id);
	if (targetChannel >= 0) {
		(useAppStore().data.channels)[targetChannel] =
			payload.new;
	}
}

export function handleDiscordDeleteChannel(ev: Event<unknown>): void {
	const payload = ev.payload as ChannelPayload;
	const channel = (useAppStore().data.channels).findIndex(
		(channel) => channel.id === payload.channel.id,
	);
	if (channel >= 0) {
		useAppStore().data.channels.splice(channel, 1);
	}
}
