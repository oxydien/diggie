<template>
	<div class="app-wrapper">
		<div class="app-sub-wrapper">
			<div class="notification-wrapper">
				<NotificationWrapper />
			</div>
			<div class="main-content-wrapper">
				<div class="side-navigation-wrapper" v-if="apx.layout.showChannels || apx.layout.showServers">
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
import { registerEvents, unregisterEvents } from "./core/events/registry";
import { tryGetSettings } from "./core/settings";

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
			apx: useAppStore(),
		};
	},
	mounted() {
		this.loaded();

		// Markdown parser
		SetupMarkdown().then((data) => {
			console.log("MARKDOWN LOADED", data);
			useAppStore().utils.markdown = data;
		});

		// Emoji data
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
		// Unregister IPC events
		unregisterEvents();
	},
	methods: {
		async loaded() {
			// Register IPC events
			registerEvents();

			// Load settings
			await tryGetSettings();

			// Send app load event to backend
			invoke("app_load");
		},
	},
};
</script>
