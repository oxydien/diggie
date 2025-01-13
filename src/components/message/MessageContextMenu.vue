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

  &.reversed {
    flex-flow: column-reverse nowrap;
  }

  .favorite-emojis {
    display: flex;
    flex-flow: row;
    gap: var(--gap-sm);
    margin-bottom: var(--gap-sm);

    .emoji {
      min-height: 30px;
    }
  }

  .hr {
    width: 100%;
    height: 3px;
    background-color: var(--button-color);
    border-radius: var(--radius-sm);
    margin-block: var(--gap-sm);
  }

  .message-context {
    position: relative;
    user-select: none;
    font-weight: 600;


    .menu-button {
      display: flex;
      flex-flow: row nowrap;
      gap: var(--gap-md);
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    &.reaction {
      .reaction-emoji-picker {
        position: absolute;
        top: 0;
        right: calc(100% + var(--gap-md));
      }
    }
  }
}
</style>

<template>
  <div class="message-context-wrapper" :class="{ 'reversed': reversed }">
    <div class="favorite-emojis" v-if="favoriteEmojis?.length">
      <Button class="emoji" v-for="emoji in favoriteEmojis" @click="addReaction(emoji)" :key="emoji">
        <span>{{ emoji }}</span>
      </Button>
    </div>
    <div class="message-context reaction btn" @click="showEmojiPicker = !showEmojiPicker"
      @keydown.enter="showEmojiPicker = !showEmojiPicker" tabindex="0">
      <div class="menu-button">
        <span>Add Reaction</span>
        <ReactionEmojiIcon />
      </div>
      <div class="reaction-emoji-picker">
        <EmojiPicker v-if="showEmojiPicker" @picked="handleEmojiPicked" />
      </div>
    </div>
    <div class="message-context reply btn btn-secondary" tabindex="0" @click="handleReplyButton"
      @keydown.enter="handleReplyButton" ref="firstButton">
      <div class="menu-button"><span>Reply</span>
        <ReplyIcon />
      </div>
    </div>
    <div class="message-context edit btn" tabindex="0" v-if="apx.user && apx.user.id == message.author.id"
      @click="handleEditButton" @keydown.enter="handleEditButton">
      <div class="menu-button"><span>Edit message</span>
        <EditIcon />
      </div>
    </div>
    <div class="message-context pin btn disabled" tabindex="0">
      <div class="menu-button"><span>Pin Message</span>
        <PinIcon />
      </div>
    </div>
    <div class="hr"></div>
    <div class="message-context copy-text btn" tabindex="0" @click="handleCopyTextButton"
      @keydown.enter="handleCopyTextButton">
      <div class="menu-button"><span>Copy Text</span>
        <CopyIcon />
      </div>
    </div>
    <div class="message-context copy-link btn" tabindex="0" @click="handleCopyLinkButton"
      @keydown.enter="handleCopyLinkButton">
      <div class="menu-button"><span>Copy Message Link</span>
        <LinkIcon />
      </div>
    </div>
    <div class="message-context copy-raw btn" tabindex="0" @click="handleCopyRawButton"
      @keydown.enter="handleCopyRawButton">
      <div class="menu-button"><span>Copy Raw Message</span>
        <CopyCodeIcon />
      </div>
    </div>
    <div class="message-context copy-id btn" tabindex="0" @click="handleCopyIdButton"
      @keydown.enter="handleCopyIdButton">
      <div class="menu-button"><span>Copy Message ID</span>
        <IdIcon />
      </div>
    </div>
    <div class="hr"></div>
    <div class="message-context delete btn btn-destructive" tabindex="0" @click="handleDeleteButton">
      <div class="menu-button"><span>Delete Message</span>
        <DeleteIcon />
      </div>
    </div>
  </div>
</template>

<script>
import ReactionEmojiIcon from "../icons/ReactionEmojiIcon.vue";
import PinIcon from "../icons/PinIcon.vue";
import CopyIcon from "../icons/CopyIcon.vue";
import CopyCodeIcon from "../icons/CopyCodeIcon.vue";
import LinkIcon from "../icons/LinkIcon.vue";
import ReplyIcon from "../icons/ReplyIcon.vue";
import DeleteIcon from "../icons/DeleteIcon.vue";
import EditIcon from "../icons/EditIcon.vue";
import IdIcon from "../icons/IdIcon.vue";
import EmojiPicker from "../EmojiPicker.vue";
import Button from "../base/Button.vue";
import { useAppStore } from "../../stores/app";
import { invoke } from "@tauri-apps/api/core";
import { tryAddReaction } from "../../core/discord/messages";

export default {
  name: "MessageContextMenu",
  components: {
    ReactionEmojiIcon,
    Button,
    PinIcon,
    CopyIcon,
    LinkIcon,
    ReplyIcon,
    DeleteIcon,
    IdIcon,
    EditIcon,
    EmojiPicker,
    CopyCodeIcon,
  },
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
    reversed: {
      type: Boolean,
      required: false,
      default: false,
    }
  },
  emits: ["close"],
  mounted() {
    this.$nextTick(() => {
      this.$refs.firstButton?.focus();
    });
  },
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
      this.apx.data.textInput.message.content = JSON.parse(
        JSON.stringify(this.message.content),
      );
      this.apx.data.textInput.message.embeds = JSON.parse(
        JSON.stringify(this.message.embeds),
      );
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
        `https://canary.discord.com/channels/@me/${this.apx.data.currentChannelId}/${this.message.id}`,
      );
      this.remove();
    },
    handleCopyRawButton(ev) {
      navigator.clipboard.writeText(JSON.stringify(this.message));
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
    addReaction(unicode) {
      tryAddReaction(
        this.apx.data.currentChannelId,
        this.message.id,
        unicode,
      );

      this.remove();
    },
    handleEmojiPicked(ev) {
      this.addReaction(ev.unicode);
    },
    remove() {
      this.$el.remove();
    },
  },
  computed: {
    favoriteEmojis() {
      const splitEmoji = (string) =>
        [...new Intl.Segmenter().segment(string)].map((x) => x.segment);
      const emojisString = this.apx.utils.clientSettings?.favorite_emojis ?? "";
      return splitEmoji(emojisString);
    },
  },
};
</script>
