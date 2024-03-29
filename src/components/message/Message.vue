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
}

.message-content {
  text-wrap: wrap;
  white-space: pre-wrap;
  overflow-wrap: break-word;
}

.message-attachments {
  img,
  video {
    width: 30vw;
  }
}

.message-reactions {
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  .reaction {
    width: fit-content;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    border-radius: var(--radius-sm);
    padding: var(--gap-sm);
    border: 2px solid var(--button-color);
  }
}
</style>

<template>
  <div
    class="message-holder"
    :class="{
      'has-reply': message.message_reference,
      replying: message.id === apx.data.textInput.replyingTo,
      editing: message.id === apx.data.textInput.editing,
      connected: ShouldConnectToPrevious,
      deleted: message.deleted,
    }"
    :id="message.id"
    @contextmenu="showContextMenu($event, message)"
  >
    <Reply :message_reference="findReply(message)" :message="message" />
    <div class="profile-holder" v-if="!ShouldConnectToPrevious">
      <img :src="`https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.webp?size=40`" />
    </div>
    <div class="message">
      <div class="message-author" v-if="!ShouldConnectToPrevious">
        <strong>{{ message.author.global_name || message.author.username }}</strong>
        <em>{{ new Date(message.timestamp).toLocaleTimeString() }}</em>
        <span class="edited" v-if="message.edited_timestamp">Edited!</span>
      </div>
      <div class="message-content">
        <span v-if="message.type === 7"><ReplyIcon />Joined</span>
        <MarkdownParser @loaded="handleMarkdownLoad" v-else :markdown="message.content" />
      </div>
      <div class="message-embeds">
        <div class="embed-wrapper" v-for="embed in message.embeds">
          <Embed :embed="embed" />
        </div>
      </div>
      <div class="message-attachments">
        <div class="attachment" v-for="file in message.attachments">
          <img :src="file.url" v-if="file.content_type.includes('image')" />
          <video :src="file.url" controls v-else-if="file.content_type.includes('video')"></video>
          <span v-else>{{ file }}</span>
        </div>
      </div>
      <div class="message-reactions">
        <div class="reaction" v-for="reaction in message.reactions">{{ reaction.emoji.name }} {{ reaction.count }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAppStore } from "../../stores/app.js";
import Reply from "./Reply.vue";
import ReplyIcon from "../icons/ReplyIcon.vue";
import Embed from "./Embed.vue";
import MarkdownParser from "./MarkdownParser.vue";
import MessageContextMenu from "./MessageContextMenu.vue";
import { createApp, h } from "vue";
export default {
  components: { Reply, Embed, MarkdownParser, ReplyIcon },
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
    showContextMenu(event, message) {
      if (this.ignoreContextMenu == true) return;
      event.preventDefault(); // Prevent default right-click menu

      if (this.apx.data.currentMessageContextMenu) {
        this.apx.data.currentMessageContextMenu.remove();
      }

      // Create a new instance of MessageContextMenu
      const contextMenu = createApp({
        render: () => h(MessageContextMenu, { message: message }),
      }).mount(document.createElement("div"));

      // Position the context menu
      contextMenu.$el.style.right = `var(--gap-md)`;
      contextMenu.$el.style.top = `var(--gap-md)`;

      // Append the context menu to the body
      this.$el.appendChild(contextMenu.$el);

      window.addEventListener("click", this.hideContextMenu, { once: true });

      this.apx.data.currentMessageContextMenu = contextMenu.$el;
    },
    hideContextMenu(event) {
      if (
        event &&
        (this.ignoredElementIds.includes(event.target.id) ||
          this.isTargetInside(event.target, this.apx.data.currentMessageContextMenu))
      ) {
        window.addEventListener("click", this.hideContextMenu, { once: true });
        return;
      }

      if (this.apx.data.currentMessageContextMenu) {
        this.apx.data.currentMessageContextMenu.remove();
        this.apx.data.currentMessageContextMenu = null;
      }
    },

    isTargetInside(target, parent) {
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
        return this.apx.data.messages.find((msg) => msg.id === message.message_reference.message_id);
      }
      return null;
    },
  },
  computed: {
    ShouldConnectToPrevious() {
      if (
        this.previousMessage &&
        !this.message.message_reference &&
        !this.previousMessage.message_reference &&
        this.previousMessage.author.id === this.message.author.id &&
        new Date(this.message.timestamp).getTime() - new Date(this.previousMessage.timestamp).getTime() < 6000
      ) {
        return true;
      }
      return false;
    },
  },
};
</script>
