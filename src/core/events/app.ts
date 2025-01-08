import { useAppStore } from "../../stores/app";
import type { Event } from "@tauri-apps/api/event";
import { handleNotification } from "../notifications/notificationHandler";

export function handleAppSavedAuthorizations(ev: Event<unknown>): void {
	// biome-ignore lint/suspicious/noExplicitAny: app-store in js
	useAppStore().data.savedAuthorizations = ev.payload as any;
}

export function handleAppNotification(ev: Event<unknown>): void {
	// biome-ignore lint/suspicious/noExplicitAny: notifications in js
	handleNotification(ev.payload as any);
}
