import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "../../stores/app";
import { clearAllData } from "./api";

export async function login(token, shouldSaveToken = false) {
	useAppStore().logging = true;
	console.debug("Logging discord user:", token, shouldSaveToken);
	await invoke("discord_login", {
		token,
		shouldSaveToken,
	});
}

export async function logout() {
	invoke("discord_logout")
		.then((data) => {
			console.log("[dis-api|logout]", data);
			clearAllData();
			invoke("app_load");
		})
		.catch((err) => {
			console.error("[dis-api|logout]", err);
		});
}
