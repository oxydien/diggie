import { useAppStore } from "../../stores/app";

/**
 * Clears all user and application state data in the app store.
 * Used when logging out.
 *
 * This function resets the following:
 * - User data: Sets the user to null.
 * - Buffers: Resets all loading and action state flags to false.
 * - Caches: Clears all cached members, channels, forums, and messages.
 * - Data: Resets current server and channel information, clears unread channels,
 *   channel history, guilds, channels, forums, direct message channels, messages,
 *   and members. Also resets text input state.
 * - Layout: Resets layout flags related to direct messages, visibility of servers,
 *   channels, members, and channel edit mode.
 */
export function clearAllData() {
	useAppStore().user = null;

	// Buffers
	useAppStore().buffer.loadingChannels = false;
	useAppStore().buffer.loadingChannelInfo = false;
	useAppStore().buffer.loadingGuilds = false;
	useAppStore().buffer.loadingGuildInfo = false;
	useAppStore().buffer.loadingMembers = false;
	useAppStore().buffer.loadingMessages = false;
	useAppStore().buffer.sendingMessage = false;
	useAppStore().buffer.editingChannel = false;

	// Caches
	useAppStore().cache.cachedMembers = {};
	useAppStore().cache.cachedChannels = {};
	useAppStore().cache.cachedForums = {};
	useAppStore().cache.cachedMessages = {};

	// Data
	useAppStore().data.currentServer = null;
	useAppStore().data.currentServerId = null;
	useAppStore().data.currentChannel = null;
	useAppStore().data.currentChannelId = null;

	useAppStore().data.unreadChannels = [];
	useAppStore().data.channelHistory = [];

	useAppStore().data.guilds = [];
	useAppStore().data.channels = [];
	useAppStore().data.forums = [];
	useAppStore().data.dmChannels = [];
	useAppStore().data.messages = [];
	useAppStore().data.members = [];

	useAppStore().data.textInput = {
		replyingTo: null,
		editing: null,
		message: {
			content: "",
		},
	};

	// Layout
	useAppStore().layout.isInDirectMessages = false;
	useAppStore().layout.showServers = false;
	useAppStore().layout.showChannels = false;
	useAppStore().layout.showMembers = false;
	useAppStore().layout.channelEditMode = false;
}
