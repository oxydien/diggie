import type { Event } from "@tauri-apps/api/event";
import { useAppStore } from "../../../stores/app";
import type { IUser } from "../../../types/types";

interface DiscordUserPayload {
	current_user: IUser;
}

export function handleDiscordUser(ev: Event<unknown>): void {
	const payload = ev.payload as DiscordUserPayload;
	useAppStore().user = payload.current_user;
}
