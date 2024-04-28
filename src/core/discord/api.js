import { useAppStore } from "../../stores/app";

export function clearAllData() {
	useAppStore().user = {};

	useAppStore().data.guilds = [];
	useAppStore().data.channels = [];
	useAppStore().data.dmChannels = [];
	useAppStore().data.members = [];
	useAppStore().data.messages = [];

	useAppStore().data.currentChannel = null;
	useAppStore().data.currentChannelId = null;
	useAppStore().data.currentServer = null;
	useAppStore().data.currentServerId = null;
	useAppStore().data.textInput = {
		replyingTo: null,
		editing: null,
		message: {
			content: "",
		},
	};
}
