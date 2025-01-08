import type { Event } from "@tauri-apps/api/event";
import { formatLog, textToHexColor } from "../../utils/color";

export function handleEvent(
	event: Event<unknown>,
	handler: (ev: Event<unknown>) => void,
) {
	const color = textToHexColor(event.event);
	const consoleFormatting = formatLog("[EVENT]", "#63C1FA", event.event, color);

	console.debug(...consoleFormatting, event.payload);

	try {
		handler(event);
	} catch (e) {
		console.error(...consoleFormatting, "Event handler failed with error:", e);
	}
}
