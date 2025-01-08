import type { Event } from "@tauri-apps/api/event";
import { useAppStore } from "../../../stores/app";
import type { DiscordUserPayload } from "./user";

interface PresencePayload {
	user: DiscordUserPayload;
	guild_id: string;
	status: string;
	game: {
		name: string;
		type: number;
	};
	activities: {
		name: string;
		type: number;
	}[];
	since: number;
	afk: boolean;
}

interface MemberPayload {
	user: DiscordUserPayload;
	status: string;
	activities: {
		name: string;
		type: number;
	}[];
}

export function handleDiscordPresenceUpdate(ev: Event<unknown>): void {
	const payload = ev.payload as PresencePayload;

	const userId = payload.user.id;
	const members = useAppStore().data.members as MemberPayload[];
	const index = members.findIndex((user) => user.user.id === userId);

	if (index !== -1) {
		members[index].status = payload.status;
		members[index].activities = payload.activities;
	}
}
