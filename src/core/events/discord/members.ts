import type { Event } from "@tauri-apps/api/event";
import { useAppStore } from "../../../stores/app";
import type { IPresence } from "../../../types/types";

interface PresencePayload {
	data: IPresence;
}

export function handleDiscordPresenceUpdate(ev: Event<unknown>): void {
	const payload = ev.payload as PresencePayload;
	const presence = payload.data;

	const userId = presence.user.id;
	const members = useAppStore().data.members;
	const index = members.findIndex((user) => user.user.id === userId);

	if (index !== -1) {
		members[index].status = presence.status;
		members[index].activities = presence.activities;
	}
}
