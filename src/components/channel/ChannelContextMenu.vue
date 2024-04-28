<style lang="scss" scoped>
.channel-context-wrapper {
  position: absolute;
  display: flex;
  flex-flow: column nowrap;
  gap: var(--gap-sm);
  background: var(--button-color-muted);
  color: var(--text-color);
  padding: var(--gap-md);
  border-radius: var(--radius-md);
  box-shadow: 0 0 2px 0 black;
  z-index: 958;

  .channel-context {
    position: relative;
    background-color: var(--button-color);
    border-radius: var(--radius-sm);
    padding: 3px;
    cursor: pointer;
    user-select: none;
    font-weight: 600;

    .menu-button {
      display: flex;
      flex-flow: row nowrap;
      gap: var(--gap-md);
      justify-content: space-between;
      align-items: center;
    }

    &:hover {
      color: var(--text-highlight-color);
      background-color: var(--primary-color);
      text-shadow: 0 0 2px black;
    }
  }
}
</style>

<template>
  <div class="channel-context-wrapper">
    <span>{{ channel.name }}</span>
    <div class="channel-context edit">
      <div class="menu-button" @click="handleEdit"><span>Edit channel</span> <EditIcon /></div>
    </div>
    <div class="channel-context duplicate">
      <div class="menu-button" @click="handleDuplicateChannel"><span>Duplicate channel</span> <CopyIcon /></div>
    </div>
    <div class="channel-context copy-link">
      <div class="menu-button" @click="handleCopyLink"><span>Copy channel link</span> <LinkIcon /></div>
    </div>
    <div class="channel-context copy-id">
      <div class="menu-button" @click="handleCopyId"><span>Copy channel ID</span> <IdIcon /></div>
    </div>
    <div class="channel-context delete">
      <div class="menu-button" @click="handleDeleteChannel"><span>Delete channel</span> <DeleteIcon /></div>
    </div>
  </div>
</template>

<script>
import EditIcon from "../icons/EditIcon.vue";
import DeleteIcon from "../icons/DeleteIcon.vue";
import IdIcon from "../icons/IdIcon.vue";
import LinkIcon from "../icons/LinkIcon.vue";
import CopyIcon from "../icons/CopyIcon.vue";
import { useAppStore } from "../../stores/app";
import { invoke } from "@tauri-apps/api/core";

export default {
  name: "ChannelContextMenu",
  components: { EditIcon, DeleteIcon, IdIcon, LinkIcon, CopyIcon },
  data() {
    return {
      apx: useAppStore(),
    };
  },
  props: {
    channel: {
      type: Object,
      required: true,
    },
    editCallback: {
      type: Function,
      required: true,
    },
  },
  emits: ["close", "edit"],
  methods: {
    handleEdit() {
      this.editCallback();
    },
    handleCopyId() {
      navigator.clipboard.writeText(this.channel.id);
    },
    handleCopyLink() {
      navigator.clipboard.writeText(`https://canary.discord.com/channels/@me/${this.channel.id}`);
    },
    handleDuplicateChannel() {
      this.apx.buffer.editingChannel = true;
      const data = JSON.stringify({
        name: this.channel.name,
        topic: this.channel.topic || "",
        type: this.channel.type,
        position: this.channel.position + 1,
        permission_overwrites: this.channel.permission_overwrites,
        parent_id: this.channel.parent_id,
        nsfw: this.channel.nsfw,
      });
      console.log("Duplicating channel", data);
      invoke("create_discord_channel", {
        guildId: this.apx.data.currentServerId,
        data,
      })
        .then((response) => console.log(response))
        .catch((e) => {
          console.error("Error while duplicating channel", e);
        })
        .finally(() => (this.apx.buffer.editingChannel = false));
    },
    handleDeleteChannel() {
      invoke("delete_discord_channel", { channelId: this.channel.id })
        .then((channel) => {
          console.debug("Removed channel", channel);
        })
        .catch((e) => {
          console.error("Couldn't remove channel:", e);
        });
    },
    remove() {
      this.$el.remove();
    },
  },
};
</script>
