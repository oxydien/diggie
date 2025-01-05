<style lang="scss" scoped>
.channel-context-wrapper {
  position: absolute;
  display: flex;
  flex-flow: column nowrap;
  gap: var(--gap-sm);
  background: var(--background-color);
  color: var(--text-color);
  padding: var(--gap-md);
  border-radius: var(--radius-md);
  box-shadow: 0 0 2px 0 black;
  z-index: 958;

  strong {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: var(--gap-sm);
    margin-bottom: var(--gap-md);
  }

  .channel-context {
    position: relative;
    user-select: none;
    font-weight: 600;

    .menu-button {
      display: flex;
      flex-flow: row nowrap;
      gap: var(--gap-md);
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>

<template>
  <div class="channel-context-wrapper">
    <strong><AutoChannelIcon :channelType="channel.type" /> {{ channel.name }}</strong>
    <div class="channel-context edit">
      <div class="menu-button btn btn-secondary" ref="firstButton" @click="handleEdit" tabindex="0"><span>Edit channel</span>
        <EditIcon />
      </div>
    </div>
    <div class="channel-context duplicate">
      <div class="menu-button btn" @click="handleDuplicateChannel" tabindex="0"><span>Duplicate channel</span>
        <CopyIcon />
      </div>
    </div>
    <div class="channel-context copy-link">
      <div class="menu-button btn" @click="handleCopyLink" tabindex="0"><span>Copy channel link</span>
        <LinkIcon />
      </div>
    </div>
    <div class="channel-context copy-id">
      <div class="menu-button btn" @click="handleCopyId" tabindex="0"><span>Copy channel ID</span>
        <IdIcon />
      </div>
    </div>
    <div class="channel-context delete">
      <div class="menu-button btn btn-destructive" @click="handleDeleteChannel" tabindex="0"><span>Delete channel</span>
        <DeleteIcon />
      </div>
    </div>
  </div>
</template>

<script>
import EditIcon from "../icons/EditIcon.vue";
import DeleteIcon from "../icons/DeleteIcon.vue";
import IdIcon from "../icons/IdIcon.vue";
import LinkIcon from "../icons/LinkIcon.vue";
import CopyIcon from "../icons/CopyIcon.vue";
import AutoChannelIcon from "../icons/AutoChannelIcon.vue";
import { useAppStore } from "../../stores/app";
import { invoke } from "@tauri-apps/api/core";
import { handleNotification } from "../../core/notifications/notificationHandler";
import { Notification } from "../../core/notifications/notification";

export default {
  name: "ChannelContextMenu",
  components: { AutoChannelIcon, EditIcon, DeleteIcon, IdIcon, LinkIcon, CopyIcon },
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
  mounted() {
    // Focus the first button
    this.$nextTick(() => {
      this.$refs.firstButton?.focus();
    });
  },
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
          handleNotification(Notification.from_json({
            title: "Error",
            message: "Error while duplicating channel",
            type: "error",
            code: e,
            duration: 5
          }))
        })
        .finally(() => { this.apx.buffer.editingChannel = false });
    },
    handleDeleteChannel() {
      invoke("delete_discord_channel", { channelId: this.channel.id })
        .then((channel) => {
          console.debug("Removed channel", channel);
        })
        .catch((e) => {
          console.error("Couldn't remove channel:", e);
          handleNotification(Notification.from_json({
            title: "Error",
            message: "Couldn't remove channel",
            type: "error",
            code: e,
            duration: 5
          }))
        });
    },
    remove() {
      this.$el.remove();
    },
  },
};
</script>
