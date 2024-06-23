<template>
  <div class="app-wrapper">
    <div class="app-sub-wrapper">
      <div class="notification-wrapper">
        <NotificationWrapper />
      </div>
      <div class="main-content-wrapper">
        <div
          class="side-navigation-wrapper"
          v-if="apx.layout.showChannels || apx.layout.showServers"
        >
          <BaseNavigation></BaseNavigation>
        </div>
        <div class="contents-wrapper">
          <RouterView />
        </div>
        <div class="members-wrapper" v-if="apx.layout.showMembers">
          <MemberNavigation />
        </div>
      </div>
    </div>
    <Notifications />
  </div>
</template>

<script>
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { RouterView } from "vue-router";
import { useAppStore } from "./stores/app";
import { getGuilds } from "./core/discord/guilds";
import { SetupMarkdown } from "./core/markdown/utils";
import BaseNavigation from "./components/nav/BaseNavigation.vue";
import MemberNavigation from "./components/nav/MemberNavigation.vue";
import { handleNotification } from "./core/notifications/notificationHandler";
import NotificationWrapper from "./components/NotificationWrapper.vue";
import Notifications from "./components/Notifications.vue";

export default {
	name: "App",
	components: {
		RouterView,
		BaseNavigation,
		MemberNavigation,
		NotificationWrapper,
		Notifications,
	},
	data() {
		return {
			cbd: (color = "#05c191") =>
				`color: white; background-color: ${color}; border-radius: 55px; padding: 2px; font-size: 12px; font-weight: 600;`,
			apx: useAppStore(),
			listeners: {
				appSavedAuthorizations: null,
				appNotifications: null,
				discordStatus: null,
				discordUserInfo: null,
				discordOnChannelCreate: null,
				discordOnChannelUpdate: null,
				discordOnChannelDelete: null,
				discordOnMessage: null,
				discordOnMessageReactionAdd: null,
				discordOnMessageReactionRemove: null,
				discordOnMessageUpdate: null,
				discordOnMessageDelete: null,
				discordOnPresenceUpdate: null,
			},
		};
	},
	mounted() {
		this.loaded();
		SetupMarkdown().then((data) => {
			console.log("MARKDOWN LOADED", data);
			useAppStore().utils.markdown = data;
		});
		import("emojibase-data/en/compact.json")
			.then((data) => {
				useAppStore().utils.emojiData = data.default;
				console.log("Emoji data", data.default);
			})
			.catch((error) => {
				console.error("Error importing emoji data:", error);
			});
	},
	beforeUnmount() {
		this.listeners.appSavedAuthorizations();
		this.listeners.appNotifications();
		this.listeners.discordStatus();
		this.listeners.discordUserInfo();
		this.listeners.discordOnChannelCreate();
		this.listeners.discordOnChannelUpdate();
		this.listeners.discordOnChannelDelete();
		this.listeners.discordOnMessage();
		this.listeners.discordOnMessageReactionAdd();
		this.listeners.discordOnMessageUpdate();
		this.listeners.discordOnMessageDelete();
		this.listeners.discordOnPresenceUpdate();
	},
	methods: {
		async loaded() {
			this.listeners.appSavedAuthorizations = await listen(
				"saved-authorizations",
				(ev) => {
					useAppStore().data.savedAuthorizations = ev.payload;
					console.log("%cListener saved-authorizations", this.cbd(), ev);
				},
			);

			this.listeners.appNotifications = await listen("notification", (ev) => {
				console.log("%cListener notification", this.cbd("#f287a2"), ev);
				handleNotification(ev.payload);
			});

			this.listeners.discordStatus = await listen(
				"discord-status",
				async (ev) => {
					try {
						useAppStore().logging = false;
						if (ev.payload.autoLog) {
							useAppStore().logging = true;
						}
						useAppStore().isLoggedIn = ev.payload.loggedIn;
						if (
							useAppStore().isLoggedIn &&
							!useAppStore().buffer.loadingGuilds
						) {
							await getGuilds();
							this.apx.layout.showChannels = this.apx.isLoggedIn;
							this.apx.layout.showServers = this.apx.isLoggedIn;
							this.apx.layout.showMembers = this.apx.isLoggedIn;
						}
						console.log("%cListener discord-status", this.cbd("#f48202"), ev);
					} catch (err) {
						console.error(
							"%cListener discord-status",
							this.cbd("#ff5202"),
							err,
						);
						handleNotification({
							type: "Error",
							title: "Error while handling discord-status",
							duration: 2,
							body: err,
						});
					}
				},
			);

			this.listeners.discordUserInfo = await listen("user-info", (ev) => {
				try {
					useAppStore().user = JSON.parse(ev.payload);
					console.debug(
						"%cListener current-user-info",
						this.cbd("#f78202"),
						ev,
					);
				} catch (err) {
					console.error("[listen | user-info]", err);
					handleNotification({
						type: "Error",
						title: "Error while handling discord-status",
						duration: 2,
						body: err,
					});
				}
			});

			this.listeners.discordOnChannelCreate = await listen(
				"discord-channel-create",
				(ev) => {
					console.debug(
						"%cListener discord-channel-create",
						this.cbd("#7282c2"),
						ev,
					);
					useAppStore().data.channels.push(ev.payload);
				},
			);

			this.listeners.discordOnChannelUpdate = await listen(
				"discord-channel-update",
				(ev) => {
					console.debug(
						"%cListener discord-channel-update",
						this.cbd("#a282c2"),
						ev,
					);
					const targetChannel = useAppStore().data.channels.findIndex(
						(channel) => channel.id === ev.payload.new.id,
					);
					if (targetChannel !== -1) {
						useAppStore().data.channels[targetChannel] = ev.payload.new;
					}
				},
			);

			this.listeners.discordOnChannelDelete = await listen(
				"discord-channel-delete",
				(ev) => {
					console.debug(
						"%cListener discord-channel-delete",
						this.cbd("#c582c2"),
						ev,
					);
					const targetChannel = useAppStore().data.channels.findIndex(
						(channel) => channel.id === ev.payload.id,
					);
					if (targetChannel !== -1) {
						useAppStore().data.channels.splice(targetChannel, 1);
					}
				},
			);

			this.listeners.discordOnMessage = await listen(
				"discord-message",
				(ev) => {
					console.debug("%cListener discord-message", this.cbd("#f48202"), ev);
					if (ev.payload.channel_id === useAppStore().data.currentChannelId) {
						useAppStore().data.messages.push(ev.payload);
					} else {
						useAppStore().data.unreadChannels.push(ev.payload.channel_id);
					}
					useAppStore().cache.cachedChannels[ev.payload.channel_id].push(
						ev.payload,
					);
				},
			);

			this.listeners.discordOnMessageReactionAdd = await listen(
				"discord-reaction-add",
				(ev) => {
					console.debug(
						"%cListener discord-reaction-add",
						this.cbd("#298202"),
						ev,
					);
					if (ev.payload.channel_id === useAppStore().data.currentChannelId) {
						const messageId = ev.payload.message_id;
						const messages = useAppStore().data.messages;
						const index = messages.findIndex(
							(message) => message.id === messageId,
						);

						if (index !== -1) {
							messages[index].reactions.push(ev.payload);
						}
					}
				},
			);

			this.listeners.discordOnMessageUpdate = await listen(
				"discord-message-update",
				(ev) => {
					console.debug(
						"%cListener discord-message-update",
						this.cbd("#828202"),
						ev,
					);
					if (
						ev.payload.event.channel_id === useAppStore().data.currentChannelId
					) {
						const messageId = ev.payload.event.id;
						const messages = useAppStore().data.messages;
						const index = messages.findIndex(
							(message) => message.id === messageId,
						);

						if (index !== -1) {
							messages[index].content = ev.payload.event.content;
							messages[index].embeds = ev.payload.event.embeds;
							messages[index].components = ev.payload.event.components;
							messages[index].edited_timestamp =
								ev.payload.event.edited_timestamp;
						}
					}
				},
			);

			this.listeners.discordOnMessageDelete = await listen(
				"discord-message-delete",
				(ev) => {
					console.debug(
						"%cListener discord-message-delete",
						this.cbd("#fa8202"),
						ev,
					);
					const messageId = ev.payload["message-id"];
					const index = useAppStore().data.messages.findIndex(
						(message) => message.id === messageId,
					);

					if (index !== -1) {
						useAppStore().data.messages[index].deleted = true;
						console.debug("Deleting message", index);
					}
				},
			);

			this.listeners.discordOnPresenceUpdate = await listen(
				"discord-presence-update",
				(ev) => {
					console.debug(
						"%cListener discord-presence-update",
						this.cbd("#af82af"),
						ev,
					);
					const userId = ev.payload.user.id;
					const index = useAppStore().data.members.findIndex(
						(user) => user.user.id === userId,
					);

					if (index !== -1) {
						useAppStore().data.members[index].status = ev.payload.status;
						useAppStore().data.members[index].activities =
							ev.payload.activities;
					}
				},
			);

			invoke("app_load");
		},
	},
};
</script>
