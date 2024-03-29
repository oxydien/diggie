import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => {
    return {
      logging: false,
      isLoggedIn: false,
      user: {},
      buffer: {
        loadingChannels: false,
        loadingGuilds: false,
        loadingGuildInfo: false,
        loadingMembers: false,
        loadingMessages: false,
      },
      cache: {
        cachedMembers: {},
        cachedChannels: {},
        cachedForums: {},
        cachedMessages: {},
      },
      data: {
        currentMessageContextMenu: null,

        currentServer: null,
        currentServerId: null,
        currentChannel: null,
        currentChannelId: null,

        unreadChannels: [],

        guilds: [],
        channels: [],
        forums: [],
        dmChannels: [],
        messages: [],
        members: [],

        textInput: {
          replyingTo: null,
          editing: null,
          message: {
            content: "",
          },
        },
      },
      layout: {
        isInDirrectMessages: false,
        showServers: true,
        showChannels: true,
        showMembers: false,
      },
    };
  },
});
