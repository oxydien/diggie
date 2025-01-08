import type { Event } from "@tauri-apps/api/event";
import { useAppStore } from "../../../stores/app";

// For now
export interface DiscordUserPayload {
	id: string;
	username: string;
	display_name: string;
	avatar: string;
	bot: boolean;
}

export function handleDiscordUser(ev: Event<unknown>): void {
	const payload = ev.payload as string;
	const json = JSON.parse(payload) as DiscordUserPayload;
	useAppStore().user = json;
}
