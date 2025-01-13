<style lang="scss" scoped>
.message-holder {
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  transition: all 120ms;
  padding-inline: 62px;

  &:hover {
    background-color: var(--highlighted-foreground-color);
  }

  &.editing,
  &.replying {
    background-color: var(--primary-muted-color);
  }

  &.has-reply {
    .profile-holder {
      padding-top: calc(var(--gap-md) * 2);
    }
  }

  &.deleted {
    color: red;
  }

  &:not(.connected) {
    padding-top: var(--gap-md);
  }
}

.profile-holder {
  position: absolute;
  left: var(--gap-md);

  img {
    height: 40px;
    width: 40px;
    border-radius: 50%;
  }
}

.message-author {
  display: flex;
  flex-flow: row nowrap;
  align-items: end;
  gap: var(--gap-sm);

  em {
    font-style: normal;
    font-size: 0.7rem;
  }

  .edited {
    font-style: italic;
    font-size: 0.7rem;
    color: var(--text-color);
  }
}

.message-content {
  text-wrap: wrap;
  white-space: pre-wrap;
  overflow-wrap: break-word;

  .message-raw {
    display: none;
    visibility: hidden;
  }
}

.message-reactions {
  width: 100%;
  display: flex;
  flex-flow: row wrap;

  .reaction {
    width: fit-content;
    gap: var(--gap-sm);
    padding: var(--gap-sm) var(--gap-md);
    border: 2px solid var(--button-color);

    &.reacted {
      border: 2px solid var(--primary-muted-color);
    }
  }
}
</style>

<template>
  <div class="message-holder" :class="{
    'has-reply': message.message_reference,
    replying: message.id === apx.data.textInput.replyingTo,
    editing: message.id === apx.data.textInput.editing,
    connected: ShouldConnectToPrevious,
    deleted: message.deleted,
  }" :id="message.id" @contextmenu="showContextMenu($event, message)">
    <Reply :message_reference="findReply(message)" :message="message" />
    <div class="profile-holder" v-if="!ShouldConnectToPrevious">
      <Avatar :src="`https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.webp?size=40`" />
    </div>
    <div class="message">
      <div class="message-author" v-if="!ShouldConnectToPrevious">
        <strong>{{ message.author.global_name || message.author.username }}</strong>
        <em>{{ translateDate(message.timestamp) }}</em>
        <span class="edited" v-if="message.edited_timestamp">Edited!</span>
      </div>
      <div class="message-content">
        <span v-if="message.type === 7">
          <ReplyIcon />Joined
        </span>
        <MarkdownParser @loaded="handleMarkdownLoad" v-else :markdown="message.content" />
        <div class="message-raw">{{ message }}</div>
      </div>
      <div class="message-stickers">
        <div class="sticker-wrapper" v-if="message.sticker_items" v-for="sticker in message.sticker_items">
          <StickerItem :sticker="sticker" />
        </div>
      </div>
      <MessagePoll :poll="message.poll" />
      <div class="message-embeds" v-if="message.embeds && message.embeds.length > 0">
        <div class="embed-wrapper" v-for="embed in message.embeds">
          <Embed :embed="embed" />
        </div>
      </div>
      <div class="message-attachments">
        <MessageAttachment v-for="file in message.attachments" :file="file" />
      </div>
      <div class="message-reactions">
        <Button class="reaction" :class="{ reacted: reaction.me || reaction.user_id === apx.user?.id }"
          v-for="reaction in message.reactions" @click="toggleReaction(reaction)">
          <strong v-html="translateEmoji(reaction.emoji.name)"> </strong>
          <span> {{ reaction.count }}</span>
        </Button>
      </div>
    </div>
  </div>
</template>

<script>
import { createApp, h } from "vue";
import { useAppStore } from "../../stores/app.ts";
import Reply from "./Reply.vue";
import ReplyIcon from "../icons/ReplyIcon.vue";
import Embed from "./Embed.vue";
import MarkdownParser from "./MarkdownParser.vue";
import twemoji from "twemoji";
import StickerItem from "./Sticker.vue";
import Avatar from "../base/Avatar.vue";
import MessagePoll from "./MessagePoll.vue";
import MessageAttachment from "./attachments/MessageAttachment.vue";
import { tryAddReaction, tryRemoveReaction } from "../../core/discord/messages.ts";
import Button from "../base/Button.vue";

export default {
  components: {
    Reply,
    Embed,
    MarkdownParser,
    ReplyIcon,
    StickerItem,
    Avatar,
    MessagePoll,
    Button,
    MessageAttachment,
  },
  data() {
    return {
      apx: useAppStore(),
      ignoredElementIds: ["emojiPickerInputBox"],
    };
  },
  props: {
    message: {
      type: Object,
      required: true,
    },
    previousMessage: {
      type: Object,
      default: null,
    },
    ignoreContextMenu: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["loaded"],
  methods: {
    handleMarkdownLoad() {
      this.$emit("loaded");
    },
    async showContextMenu(event, message) {
      if (this.ignoreContextMenu === true) return;
      event.preventDefault(); // Prevent default right-click menu

      if (this.apx.data.currentMessageContextMenu) {
        this.apx.data.currentMessageContextMenu.remove();
      }

      const loadAndMountComponent = async () => {
        const { default: MessageContextMenu } = await import(
          "./MessageContextMenu.vue"
        );

        const halfHeight = window.innerHeight / 2;
        const halfWidth = window.innerWidth / 2;

        const contextMenu = createApp(MessageContextMenu, {
          message: message,
          reversed: event.clientY >= halfHeight,
        }).mount(document.createElement("div"));

        // Position the context menu
        const bounding = this.$el.getBoundingClientRect();
        const x = event.clientX - bounding.left;
        const y = event.clientY - bounding.top;

        contextMenu.$el.style.top = event.clientY < halfHeight ? `${y}px` : 'auto';
        contextMenu.$el.style.bottom = event.clientY < halfHeight ? 'auto' : `${bounding.height - y}px`;

        contextMenu.$el.style.left = event.clientX < halfWidth ? `${x}px` : 'auto';
        contextMenu.$el.style.right = event.clientX < halfWidth ? 'auto' : `${bounding.width - x}px`;

        // Append the context menu to the body
        this.$el.appendChild(contextMenu.$el);

        window.addEventListener("click", this.hideContextMenu, { once: true });

        this.apx.data.currentMessageContextMenu = contextMenu.$el;
      };

      await loadAndMountComponent();
    },
    hideContextMenu(event) {
      if (
        event &&
        (this.ignoredElementIds.includes(event.target.id) ||
          this.isTargetInside(
            event.target,
            this.apx.data.currentMessageContextMenu,
          ))
      ) {
        window.addEventListener("click", this.hideContextMenu, { once: true });
        return;
      }

      if (this.apx.data.currentMessageContextMenu) {
        this.apx.data.currentMessageContextMenu.remove();
        this.apx.data.currentMessageContextMenu = null;
      }
    },
    translateEmoji(data) {
      return twemoji.parse(data, {
        base: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/",
      });
    },
    translateDate(timestamp) {
      const now = Date.now();
      const date = new Date(timestamp);
      const diffInSeconds = (now - date.getTime()) / 1000;
      if (diffInSeconds > 86400) {
        return new Date(timestamp).toLocaleDateString();
      }
      return new Date(timestamp).toLocaleTimeString();
    },
    isTargetInside(target, parent) {
      if (!parent) {
        return false;
      }
      if (parent.contains(target)) {
        return true;
      }
      for (let i = 0; i < parent.children.length; i++) {
        if (this.isTargetInside(target, parent.children[i])) {
          return true;
        }
      }
      return false;
    },
    findReply(message) {
      if (message.message_reference) {
        return this.apx.data.messages.find(
          (msg) => msg.id === message.message_reference.message_id,
        );
      }
      return null;
    },
    toggleReaction(reaction) {
      if (reaction.me) {
        tryRemoveReaction(this.message.channel_id, this.message.id, reaction.emoji.name);
      } else {
        tryAddReaction(this.message.channel_id, this.message.id, reaction.emoji.name);
      }
    }
  },
  computed: {
    ShouldConnectToPrevious() {
      if (
        this.previousMessage &&
        !this.message.message_reference &&
        !this.previousMessage.message_reference &&
        this.previousMessage.author.id === this.message.author.id &&
        new Date(this.message.timestamp).getTime() -
        new Date(this.previousMessage.timestamp).getTime() <
        34000
      ) {
        return true;
      }
      return false;
    },
    isVideoAllowed() {
      return useAppStore().utils.clientSettings?.render_videos ?? true;
    }
  },
};
</script>
