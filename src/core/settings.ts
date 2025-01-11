import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "../stores/app";
import { formatLog } from "../utils/color";
import { handleNotification } from "./notifications/notificationHandler";
import type IClientSettings from "../types/IClientSettings";

/**
 * Tries to get the client settings from the Tauri backend.
 * If the invocation fails, it logs the error and shows a notification.
 */
export async function tryGetSettings() {
  try {
    const settings = await invoke("get_client_settings");
    useAppStore().utils.clientSettings = settings as IClientSettings;
    
    console.log(...formatLog("CLIENT SETTINGS", "#64ff35"), settings);
  } catch (error) {
    console.error(
      ...formatLog("CLIENT SETTINGS ERROR", "#64ff35"),
      error,
    );
    handleNotification({
      type: "Error",
      title: "Error getting client settings",
      duration: 2,
      body: error,
    });
  }
}