import { createApp } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import { useAppStore } from "./stores/app";
import { createPinia } from "pinia";
import observeVisibility from "./core/observers/video";
import "./assets/styles/global.scss";
import App from "./App.vue";

const routes = [
  { path: "/", component: () => import("./pages/Index.vue") },
  { path: "/server/:serverId", component: () => import("./pages/GuildInfo.vue") },
  { path: "/server/:serverId/:channelId", component: () => import("./pages/Chat.vue") },
  { path: "/server/:serverId/edit/:channelId", component: () => import("./pages/EditChannel.vue") },
  { path: "/forum/:serverId/:channelId", component: () => import("./pages/Forum.vue") },
  { path: "/embed/:serverId/:channelId", component: () => import("./pages/EmbedEditor.vue") },
];

const appRouter = createRouter({
  history: createWebHashHistory(),
  routes,
});

const pinia = createPinia();
createApp(App).use(pinia).use(appRouter).directive("observe-visibility", observeVisibility).mount("#app");

// default utils

document.addEventListener("keydown", (event) => {
  // Disable Ctrl + R
  if (event.ctrlKey && event.key === "r") {
    event.preventDefault();
  }
  // Disable F5
  if (event.key === "F5") {
    event.preventDefault();
  }
});
