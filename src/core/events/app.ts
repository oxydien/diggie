import { useAppStore } from "../../stores/app";
import type { Event } from "@tauri-apps/api/event";
import { handleNotification } from "../notifications/notificationHandler";
import {ISavedAuth} from "../../types/ISavedAuth";

interface SavedAuthorizationPayload {
	authorizations: ISavedAuth[];
}

export function handleAppSavedAuthorizations(ev: Event<unknown>): void {
	const payload = ev.payload as SavedAuthorizationPayload;
	useAppStore().data.savedAuthorizations = payload.authorizations;
}

export function handleAppNotification(ev: Event<unknown>): void {
	// biome-ignore lint/suspicious/noExplicitAny: notifications in js
	handleNotification(ev.payload as any);
}
