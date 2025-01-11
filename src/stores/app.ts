import { defineStore } from "pinia";
import type {
	IChannel,
	IMember,
	IUser,
	IMessage,
	IGuild,
	IClientSettings,
} from "../types/types";

export const useAppStore = defineStore("app", {
	state: () => {
		return {
			// Indicates if the user is waiting for login response
			logging: false,
			// Indicates if the user is logged in
			isLoggedIn: false,
			// User data or null if not logged in
			user: null as IUser | null,

			// Indicates if the app is loading some data
			buffer: {
				loadingChannels: false,
				loadingChannelInfo: false,

				loadingGuilds: false,
				loadingGuildInfo: false,
				loadingMembers: false,

				loadingMessages: false,
				sendingMessage: false,

				editingChannel: false,
			},
			cache: {
				// Members for each guild (guild_id => members)
				cachedMembers: {} as { [key: string]: IMember[] },
				// Channels for each guild (guild_id => channels)
				cachedChannels: {} as { [key: string]: IChannel[] },
				// Forums for each guild (guild_id => channels)
				cachedForums: {} as { [key: string]: IChannel[] },
				// Messages for each channel (channel_id => messages)
				cachedMessages: {} as { [key: string]: IMessage[] },
			},
			data: {
				// Context menu elements
				currentMessageContextMenu: null as HTMLElement | null,
				currentChannelContextMenu: null as HTMLElement | null,

				// Current server if within a server
				currentServer: null as IGuild | null,
				// Current server id, can be "dms" if the user is in direct messages
				currentServerId: null as string | null,

				// Current channel if within a channel
				currentChannel: null as IChannel | null,
				currentChannelId: null as string | null,

				// Channel Ids that are unread
				unreadChannels: [] as string[],
				// List of channel history, from oldest to newest
				channelHistory: [] as string[],

				// Data displayed
				guilds: [] as IGuild[],
				channels: [] as IChannel[],
				forums: [] as IChannel[],
				dmChannels: [] as IChannel[], // unused
				messages: [] as IMessage[],
				members: [] as IMember[],

				// Current text input
				textInput: {
					// Message Id of the message being replied to
					replyingTo: null,
					// Message Id of the message being edited
					editing: null,
					// Data of the message created
					message: {
						content: "",
					},
				},

				// Saved authorizations, used for logging in
				savedAuthorizations: [],
			},

			// Layout options, used for showing/hiding elements
			layout: {
				isInDirectMessages: false,
				showServers: false,
				showChannels: false,
				showMembers: false,
				// Edit buttons next to channels
				channelEditMode: false,
			},
			utils: {
				// Markdown parser instance
				markdown: null,
				// Twemoji emoji data
				emojiData: [] as {
					label: string;
					group: string;
					hexcode: string;
					unicode: string;
					url: string;
				}[],
				// Client settings, loaded on startup
				clientSettings: null as IClientSettings | null,
			},
		};
	},
});
