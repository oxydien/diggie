import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "../../stores/app";

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
    })
    .catch((err) => {
      console.error("[dis-api|logout]", err);
    });
}

export async function getGuilds() {
  useAppStore().buffer.loadingGuilds = true;
  invoke("get_discord_guilds")
    .then((data) => {
      const json = JSON.parse(data);
      useAppStore().data.guilds = json;
      console.log("[dis-api|getGuilds]", json);
    })
    .catch((err) => {
      console.error("[dis-api|getGuilds]", err);
    })
    .finally(() => {
      useAppStore().buffer.loadingGuilds = false;
    });
}

export async function getGuildInfo(id) {
  useAppStore().buffer.loadingGuildInfo = true;
  invoke("get_discord_guild_info", { guildId: id })
    .then((data) => {
      const json = JSON.parse(data);
      json.roles
        .sort((a, b) => b.position - a.position)
        .map((el) => {
          el.color = el.color.toString(16).substring(0, 6) || "gray";
          return el;
        });
      useAppStore().data.currentServer = json;
      console.log("[dis-api|getGuildInfo]", json);
    })
    .catch((err) => {
      console.error("[dis-api|getGuildInfo]", err);
    })
    .finally(() => {
      useAppStore().buffer.loadingGuildInfo = false;
    });
}

export async function getGuildMembers(id) {
  useAppStore().buffer.loadingMembers = true;
  invoke("get_discord_guild_members", { guildId: id })
    .then((data) => {
      const json = JSON.parse(data);
      useAppStore().data.members = json;
      console.log("[dis-api|getGuildMembers]", json);
    })
    .catch((err) => {
      console.error("[dis-api|getGuildMembers]", err);
    })
    .finally(() => {
      useAppStore().buffer.loadingMembers = false;
    });
}

export async function getChannels(guildId) {
  useAppStore().buffer.loadingChannels = true;
  invoke("get_discord_channels", { guildId })
    .then((data) => {
      const json = JSON.parse(data);
      useAppStore().data.channels = json;
      useAppStore().cache.cachedChannels[guildId] = json;
      console.log("[dis-api|getChannels]", json);
    })
    .catch((err) => {
      console.error("[dis-api|getChannels]", err);
    })
    .finally(() => {
      useAppStore().buffer.loadingChannels = false;
    });
}

export async function getDms() {
  useAppStore().buffer.loadingChannels = true;
  invoke("get_discord_dirrect_channels")
    .then((data) => {
      console.log("[get_discord_dirrect_channels]", data);
      useAppStore().data.channels = JSON.parse(data);
      useAppStore().data.currentServer = {};
      useAppStore().data.currentServerId = "dms";
    })
    .catch((err) => {
      console.error("[get_discord_dirrect_channels]", err);
    })
    .finally(() => {
      useAppStore().buffer.loadingChannels = false;
    });
}

export async function getForums(channelId) {
  useAppStore().buffer.loadingChannels = true;
  invoke("discord_get_forum_channels", { channelId })
    .then((data) => {
      const json = JSON.parse(data);
      useAppStore().data.forums = json;
      useAppStore().cache.cachedForums[channelId] = json;
      console.log("[dis-api|getForums]", json);
    })
    .catch((err) => {
      console.error("[dis-api|getForums]", err);
    })
    .finally(() => {
      useAppStore().buffer.loadingChannels = false;
    });
}

export async function getMessages(channelId) {
  useAppStore().buffer.loadingMessages = true;
  invoke("get_discord_messages", { channelId })
    .then((data) => {
      const json = JSON.parse(data);
      useAppStore().data.messages = json;
      useAppStore().cache.cachedMessages[channelId] = json;
      console.log("[dis-api|getMessages]", json);
    })
    .catch((err) => {
      console.error("[dis-api|getMessages]", err);
    })
    .finally(() => {
      useAppStore().buffer.loadingMessages = false;
    });
}
