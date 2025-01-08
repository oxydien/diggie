import type { Event } from "@tauri-apps/api/event";
import { useAppStore } from "../../../stores/app";
import { getGuilds } from "../../discord/guilds";

interface DiscordStatusPayload {
  loggedIn: boolean;
  autoLog: boolean;
}

export function handleDiscordStatus(ev: Event<unknown>): void {
  const payload = ev.payload as DiscordStatusPayload;

  useAppStore().logging = false;
  if (payload.autoLog) {
    useAppStore().logging = true;
  }
  useAppStore().isLoggedIn = payload.loggedIn;
  if (
    useAppStore().isLoggedIn &&
    !useAppStore().buffer.loadingGuilds
  ) {
    getGuilds().catch((err) => {
      console.error("[dis-api|event|status]", "getGuilds call", err);
    })
    useAppStore().layout.showChannels = useAppStore().isLoggedIn;
    useAppStore().layout.showServers = useAppStore().isLoggedIn;
    useAppStore().layout.showMembers = useAppStore().isLoggedIn;
  }
}
