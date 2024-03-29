<style lang="scss" scoped>
.message-context-wrapper {
  position: absolute;
  display: flex;
  flex-flow: column nowrap;
  gap: var(--gap-sm);
  background: var(--button-color-muted);
  color: var(--text-color);
  padding: var(--gap-md);
  border-radius: var(--radius-md);
  z-index: 957;

  .message-context {
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

    &.reaction {
      .reaction-emoji-picker {
        position: absolute;
        right: 100%;
      }
    }
  }
}
</style>

<template>
  <div class="message-context-wrapper">
    <span>{{ message.author.username }}</span>
    <div class="message-context reaction">
      <div class="menu-button" @click="showEmojiPicker = !showEmojiPicker">
        <span>Add Reaction</span> <ReactionEmojiIcon />
      </div>
      <div class="reaction-emoji-picker">
        <EmojiPicker v-if="showEmojiPicker" @picked="handleEmojiPicked" />
      </div>
    </div>
    <div class="message-context pin">
      <div class="menu-button"><span>Pin Message</span> <PinIcon /></div>
    </div>
    <div
      class="message-context copy-text"
      v-if="apx.user && apx.user.id == message.author.id"
      @click="handleEditButton"
    >
      <div class="menu-button"><span>Edit message</span> <EditIcon /></div>
    </div>
    <div class="message-context copy-text" @click="handleCopyTextButton">
      <div class="menu-button"><span>Copy Text</span> <CopyIcon /></div>
    </div>
    <div class="message-context copy-link" @click="handleCopyLinkButton">
      <div class="menu-button"><span>Copy Message Link</span> <LinkIcon /></div>
    </div>
    <div class="message-context reply" @click="handleReplyButton">
      <div class="menu-button"><span>Reply</span> <ReplyIcon /></div>
    </div>
    <div class="message-context delete" @click="handleDeleteButton">
      <div class="menu-button"><span>Delete Message</span> <DeleteIcon /></div>
    </div>
    <div class="message-context copy-id" @click="handleCopyIdButton">
      <div class="menu-button"><span>Copy Message ID</span> <IdIcon /></div>
    </div>
  </div>
</template>

<script>
import ReactionEmojiIcon from "../icons/ReactionEmojiIcon.vue";
import PinIcon from "../icons/PinIcon.vue";
import CopyIcon from "../icons/CopyIcon.vue";
import LinkIcon from "../icons/LinkIcon.vue";
import ReplyIcon from "../icons/ReplyIcon.vue";
import DeleteIcon from "../icons/DeleteIcon.vue";
import EditIcon from "../icons/EditIcon.vue";
import IdIcon from "../icons/IdIcon.vue";
import EmojiPicker from "../EmojiPicker.vue";
import { useAppStore } from "../../stores/app";
import { invoke } from "@tauri-apps/api/core";

export default {
  name: "MessageContextMenu",
  components: { ReactionEmojiIcon, PinIcon, CopyIcon, LinkIcon, ReplyIcon, DeleteIcon, IdIcon, EditIcon, EmojiPicker },
  data() {
    return {
      apx: useAppStore(),
      showEmojiPicker: false,
    };
  },
  props: {
    message: {
      type: Object,
      required: true,
    },
  },
  emits: ["close"],
  methods: {
    handleReplyButton(ev) {
      this.apx.data.textInput.editing = null;
      this.apx.data.textInput.replyingTo = this.message.id;
      this.remove();
    },
    handleCopyIdButton(ev) {
      navigator.clipboard.writeText(this.message.id);
      this.remove();
    },
    handleEditButton(ev) {
      this.apx.data.textInput.replyingTo = null;
      this.apx.data.textInput.editing = this.message.id;
      this.apx.data.textInput.message.content = JSON.parse(JSON.stringify(this.message.content));
      this.apx.data.textInput.message.embeds = JSON.parse(JSON.stringify(this.message.embeds));
      this.remove();
    },
    handleCopyTextButton(ev) {
      if (this.message.content.trim()) {
        navigator.clipboard.writeText(this.message.content);
      } else if (this.message.attachments.length > 0) {
        navigator.clipboard.writeText(this.message.attachments[0].url);
      }
      this.remove();
    },
    handleCopyLinkButton(ev) {
      navigator.clipboard.writeText(
        `https://canary.discord.com/channels/@me/${this.apx.data.currentChannelId}/${this.message.id}`
      );
      this.remove();
    },
    handleDeleteButton(ev) {
      invoke("discord_delete_message", {
        channelId: this.apx.data.currentChannelId,
        messageId: this.message.id,
      })
        .then((data) => {
          console.log("[discord_delete_message]", data);
        })
        .catch((err) => {
          console.error("[discord_delete_message]", err);
        });
      this.remove();
    },
    handleEmojiPicked(ev) {
      console.log("[MessageContectMenu]", "(handleEmojiPicked)", "DEBUG:", ev);
      invoke("discord_create_reaction", {
        channelId: this.apx.data.currentChannelId,
        messageId: this.message.id,
        emoji: ev.unicode,
      })
        .then((data) => {
          console.log("[discord_create_reaction]", data);
        })
        .catch((err) => {
          console.error("[discord_create_reaction]", err);
        });
      this.remove();
    },
    remove() {
      this.$el.remove();
    },
  },
};
</script>
