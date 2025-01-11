import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "../../stores/app";
import { clearAllData } from "./api";
import { formatLog } from "../../utils/color";

/**
 * Logs the user into the app.
 * @param {string} token - The bot token to use
 * @param {boolean} [shouldSaveToken=false] - If true, saves the token to the user's computer
 * @return {Promise<void>} A promise that resolves when the login is complete
 */
export async function login(token: string, shouldSaveToken = false) {
	console.debug(
		...formatLog("AUTH", "#63C1FA"),
		"Logging discord user:",
		token, // <- NOTICE: The bot token is logged directly into the console, this may be a security risk. Will be removed in the future
		shouldSaveToken,
	);

	useAppStore().logging = true;
	await invoke("discord_login", {
		token,
		shouldSaveToken,
	});
}

/**
 * Logs the user out of the app.
 * @return {Promise<void>} A promise that resolves when the logout is complete
 */
export async function logout() {
	console.debug(...formatLog("AUTH", "#63C1FA"), "Logging discord user out");

	useAppStore().logging = true;
	invoke("discord_logout")
		.then((data) => {
			console.log(
				...formatLog("AUTH", "#63C1FA"),
				"Successfully logged out",
				"additional data:",
				data,
			);

			// Clear all session data
			clearAllData();

			// Inform backend that the user is ready to log in
			invoke("app_load");
		})
		.catch((err) => {
			console.error(...formatLog("AUTH", "#63C1FA"), "Failed to log out", err);
		})
		.finally(() => {
			useAppStore().logging = false;
		});
}
