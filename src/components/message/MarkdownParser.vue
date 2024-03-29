<template>
  <div class="markdown-content" v-html="parsedMarkdown"></div>
</template>

<script>
import { parse } from "marked";
import { useAppStore } from "../../stores/app";

export default {
  props: {
    markdown: {
      type: String,
      required: true,
      default: "",
    },
  },
  emits: ["loaded"],
  computed: {
    parsedMarkdown() {
      let md = this.markdown.trim();

      // Will probably add some DOMPurify, just have this for now
      md = md.replaceAll("<", "&lt;");
      // TODO: Add some better XSS protection for markdown parser!

      md = md.replaceAll("\n", "\n\n");
      md = md.replace(/&lt;@(\d+)>/g, (match, userId) => {
        const index = useAppStore().data.members.findIndex((user) => user.user.id === userId);
        let member = null;
        if (index !== -1) {
          member = useAppStore().data.members[index];
        }
        return `<mention-placeholder class="mention-placeholder" user-id="${userId}">@${
          member?.user.username || userId
        }</mention-placeholder>`;
      });
      md = md.replace(/&lt;@&(\d+)>/g, (match, roleId) => {
        const index = useAppStore().data.currentServer?.roles?.findIndex((role) => role.id === roleId);
        let role = null;
        if (index !== -1) {
          role = useAppStore().data.currentServer.roles[index];
        }
        return `<role-mention-placeholder class="role-mention-placeholder" role-id="${roleId}">@&${
          role ? role.name : roleId
        }</role-mention-placeholder>`;
      });
      md = md.replace(/&lt;#(\d+)>/g, (match, channelId) => {
        const channel = useAppStore().cache.cachedChannels[channelId];
        return `<channel-placeholder class="channel-placeholder" channel-id="${channelId}">#${
          channel ? channel.name : channelId
        }</channel-placeholder>`;
      });
      md = md.replace(/(\|\|)(.*?)(\|\|)/g, (match, p1, p2, p3) => {
        return `<spoiler-placeholder class="spoiler-placeholder">${p2}</spoiler-placeholder>`;
      });

      const data = parse(md)
        .trim()
        .replace(/<t:(\d+):[a-zA-Z_]>/g, (match, timestamp) => {
          console.log(match, timestamp);
          const date = new Date(parseInt(timestamp) * 1000);
          return date.toLocaleString();
        })
        .replaceAll("\n", "");

      this.$emit("loaded");
      return data;
    },
  },
};
</script>
