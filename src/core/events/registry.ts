import { listen, type Event, type UnlistenFn } from "@tauri-apps/api/event";
import { handleEvent } from "./handler";
import { formatLog, textToHexColor } from "../../utils/color";
import { handleAppNotification, handleAppSavedAuthorizations } from "./app";
import { handleDiscordStatus } from "./discord/status";
import { handleDiscordUser } from "./discord/user";
import {
	handleDiscordCreateChannel,
	handleDiscordChannelUpdate,
	handleDiscordDeleteChannel,
} from "./discord/channels";
import {
	handleDiscordMessage,
	handleDiscordMessageDelete,
	handleDiscordMessageUpdate,
} from "./discord/messages";
import { handleDiscordReactionAdd, handleDiscordReactionRemove } from "./discord/reactions";
import { handleDiscordPresenceUpdate } from "./discord/members";

const UNLISTEN_EVENTS = new Map<string, UnlistenFn>();

function registerEvent(name: string, handler: (ev: Event<unknown>) => void) {
	const color = textToHexColor(name);
	const consoleFormatting = (title: string) =>
		formatLog(title, "#63C1FA", name, color);

	listen(name, (ev) => {
		handleEvent(ev, handler);
	})
		.then((unlisten) => {
			console.log(...consoleFormatting("REGISTRY"), "Registered successfully");

			UNLISTEN_EVENTS.set(name, unlisten);
		})
		.catch((err) => {
			console.error(
				...consoleFormatting("REGISTRY ERROR"),
				"Failed to register",
				err,
			);
		});
}

export function unregisterEvents() {
	for (const [name, unlisten] of UNLISTEN_EVENTS) {
		unlisten();

		const color = textToHexColor(name);
		console.log(...formatLog("REGISTRY UNREGISTER", "#63C1FA", name, color),
		);
	}
}

export function registerEvents() {
	console.log(...formatLog("REGISTRY", "#63C1FA"), "Registering events...");

	const handlers = [
		// APP
		["saved-authorizations", handleAppSavedAuthorizations],
		["notification", handleAppNotification],

		// DISCORD
		["discord-status", handleDiscordStatus],
		["user-info", handleDiscordUser],
		// DISCORD channels
		["discord-channel-create", handleDiscordCreateChannel],
		["discord-channel-update", handleDiscordChannelUpdate],
		["discord-channel-delete", handleDiscordDeleteChannel],
		// DISCORD messages
		["discord-message", handleDiscordMessage],
		["discord-message-update", handleDiscordMessageUpdate],
		["discord-message-delete", handleDiscordMessageDelete],
		// DISCORD reactions
		["discord-reaction-add", handleDiscordReactionAdd],
		["discord-reaction-remove", handleDiscordReactionRemove],
		// DISCORD members
		["discord-presence-update", handleDiscordPresenceUpdate],
	] as const;

	for (const [name, handler] of handlers) {
		registerEvent(name, handler);
	}

}
