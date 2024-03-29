<style lang="scss" scoped>
@mixin disableDefaultButton {
  border: none;
  color: var(--text-color);
  background-color: var(--button-color);
  border-radius: var(--radius-md);
  cursor: pointer;
}

*::-webkit-scrollbar {
  width: 6px;
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background-color: var(--primary-color);
  transition: all 50ms;
  border-radius: 20px;
  cursor: pointer;

  &:hover {
    background-color: var(--primary-muted-color);
  }
}

.chat-wrapper {
  display: grid;
  grid-template-rows: 30px 100fr auto;
  height: 100%;
}

.channel-info {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  padding: 2px;
  border-bottom: 1px solid var(--button-color);

  span {
    display: flex;
    gap: var(--gap-sm);
    align-items: center;
  }

  button {
    @include disableDefaultButton();
    display: grid;
    place-items: center;
    height: 100%;
    border-radius: var(--radius-sm);
    transform: rotate(180deg);
  }
}

.chat-contents {
  max-width: 100%;
  overflow-x: clip;
  overflow-y: auto;

  & > :last-child {
    padding-bottom: 2rem;
  }
}

.chat-inputs-wrapper {
  position: relative;

  .chat-inputs {
    display: grid;
    align-items: center;
    grid-template-columns: 100fr 40px 40px auto;
    gap: var(--gap-sm);

    textarea {
      width: var(--_chat-input-width);
      min-height: 40px;
      background-color: var(--button-color);
      color: var(--text-color);
      border-radius: var(--radius-sm);
      border: none;
      margin-top: var(--gap-sm);
      padding: 0.2rem 0.2rem 0 0.7rem;
      font-size: 1.2rem;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell,
        "Open Sans", "Helvetica Neue", sans-serif;
      resize: none;
    }

    button {
      @include disableDefaultButton();
      height: calc(100% - var(--gap-sm));
      display: grid;
      place-items: center;
      margin-top: var(--gap-sm);
      border-radius: var(--radius-sm);

      &:hover {
        background-color: var(--primary-color);
        color: var(--text-highlight-color);
        text-shadow: 0 0 2px black;
      }
    }
  }
}
</style>

<template>
  <div class="chat-wrapper">
    <div class="channel-info">
      <span
        ><LoadingIcon v-if="apx.buffer.loadingMessages" />{{
          apx.data.currentChannel ? apx.data.currentChannel.name : ""
        }}</span
      >
      <button @click="apx.layout.showMembers = !apx.layout.showMembers">
        <ShowLayoutIcon :show="apx.layout.showMembers" />
      </button>
    </div>
    <div class="chat-contents" ref="chatContentWrapper">
      <div
        class="message-wrapper"
        :class="{ 'has-reply': message.message_reference }"
        v-for="(message, index) in messages"
      >
        <Message :message="message" @loaded="scrollBottom" :previousMessage="messages[index - 1] || null" />
      </div>
    </div>
    <div class="chat-inputs-wrapper">
      <MsgInputMoreMenu v-if="showMoreContextMenu" />
      <div class="replies" v-if="apx.data.textInput.replyingTo" @click="cancelReplying" title="Cancel reply">
        Replying to
        <strong>{{ getReplyingToMessage.author.global_name || getReplyingToMessage.author.username }}</strong>
      </div>
      <div class="editing" v-if="apx.data.textInput.editing" @click="cancelEditing" title="Cancel editing">
        Editing
        <strong>{{ apx.data.textInput.editing }}</strong>
      </div>
      <div class="attachments">
        <Attachments />
      </div>
      <div class="chat-inputs">
        <textarea
          ref="mainChatInput"
          @keypress.enter="sendMessageEnter"
          placeholder="Message here..."
          wrap="hard"
          rows="1"
          @input="apx.data.textInput.message.content = $event.target.value"
          >{{ apx.data.textInput.message.content }}</textarea
        >
        <button @click="showMoreContextMenu = !showMoreContextMenu">...</button>
        <button @click="sendMessageClick"><SendIcon /></button>
      </div>
    </div>
  </div>
</template>

<script>
import { useAppStore } from "../stores/app";
import { invoke } from "@tauri-apps/api/core";
import ReplyIcon from "../components/icons/ReplyIcon.vue";
import SendIcon from "../components/icons/SendIcon.vue";
import ShowLayoutIcon from "../components/icons/ShowLayoutIcon.vue";
import Message from "../components/message/Message.vue";
import MsgInputMoreMenu from "../components/message/MsgInputMoreMenu.vue";
import LoadingIcon from "../components/icons/LoadingIcon.vue";
import Attachments from "../components/message/Attachments.vue";

export default {
  components: { ReplyIcon, Attachments, SendIcon, ShowLayoutIcon, Message, MsgInputMoreMenu, LoadingIcon },
  data() {
    return {
      apx: useAppStore(),
      showMoreContextMenu: false,
    };
  },
  watch: {
    "apx.data.messages"(newValue) {
      this.scrollBottom();
    },
    "apx.data.textInput.message.content"(newValue) {
      const el = this.$refs.mainChatInput;
      el.value = newValue;
      el.rows = Math.min(10, this.countLines(el));
    },
  },
  mounted() {
    const index = this.apx.data.unreadChannels.findIndex(el => el === this.apx.data.currentChannelId);
    if (index !== -1) {
      this.apx.data.unreadChannels.splice(index, 1);
    }
  },
  methods: {
    scrollBottom() {
      this.$nextTick(() => {
        const scrollableElement = this.$refs.chatContentWrapper;
        scrollableElement.scrollTop = scrollableElement.scrollHeight;
      });
    },
    cancelReplying() {
      this.apx.data.textInput.replyingTo = null;
    },
    cancelEditing() {
      this.apx.data.textInput.editing = null;
    },
    sendMessageClick(ev) {
      const inputEl = this.$refs.mainChatInput;
      if (inputEl) {
        const message = inputEl.value.trim();
        console.log(ev, message);
        if (message || (this.apx.data.textInput.message.embeds && this.apx.data.textInput.message.embeds.length > 0)) {
          console.log(ev, message);
          this.sendRawMessage();
          inputEl.value = "";
          this.apx.data.textInput.message.content = "";
          inputEl.rows = 1;
        }
      }
    },
    countLines(textarea) {
      var _buffer;
      if (!_buffer) {
        _buffer = document.createElement("textarea");
        _buffer.style.border = "none";
        _buffer.style.height = "0";
        _buffer.style.overflow = "hidden";
        _buffer.style.padding = "0";
        _buffer.style.position = "absolute";
        _buffer.style.left = "0";
        _buffer.style.top = "0";
        _buffer.style.zIndex = "-1";
        document.body.appendChild(_buffer);
      }

      var cs = window.getComputedStyle(textarea);
      var pl = parseInt(cs.paddingLeft);
      var pr = parseInt(cs.paddingRight);
      var lh = parseInt(cs.lineHeight);

      if (isNaN(lh)) lh = parseInt(cs.fontSize);

      _buffer.style.width = textarea.clientWidth - pl - pr + "px";
      _buffer.style.font = cs.font;
      _buffer.style.letterSpacing = cs.letterSpacing;
      _buffer.style.whiteSpace = cs.whiteSpace;
      _buffer.style.wordBreak = cs.wordBreak;
      _buffer.style.wordSpacing = cs.wordSpacing;
      _buffer.style.wordWrap = cs.wordWrap;

      _buffer.value = textarea.value;

      var result = Math.floor(_buffer.scrollHeight / lh);
      if (result == 0) result = 1;
      return result;
    },
    sendMessageEnter(ev) {
      if (ev.shiftKey) return;
      ev.preventDefault();
      const inputEl = this.$refs.mainChatInput;
      if (inputEl) {
        const message = inputEl.value.trim();
        console.log(ev, message);
        if (message || (this.apx.data.textInput.message.embeds && this.apx.data.textInput.message.embeds.length > 0)) {
          this.sendRawMessage();
          inputEl.value = "";
          this.apx.data.textInput.message.content = "";
          inputEl.rows = 1;
        }
      }
    },
    sendMessage() {
      const data = { channelId: this.apx.data.currentChannelId, content: this.apx.data.textInput.message.content };
      console.log("Sending message", data);
      invoke("send_simple_discord_message", data)
        .then((data) => {
          console.log("[send_simple_discord_message]", data);
        })
        .catch((err) => {
          console.error("[send_simple_discord_message]", err);
        });
    },
    sendRawMessage() {
      if (this.apx.data.textInput.replyingTo) {
        this.sendRawReplyMessage();
        return;
      }
      if (this.apx.data.textInput.editing) {
        this.sendRawEditMessage();
        return;
      }
      const data = {
        channelId: this.apx.data.currentChannelId,
        content: JSON.stringify(this.apx.data.textInput.message),
      };
      console.log("Sending raw message", data);
      invoke("send_raw_discord_message", data)
        .then((data) => {
          console.log("[send_raw_discord_message]", data);
        })
        .catch((err) => {
          console.error("[send_raw_discord_message]", err);
        });
    },
    sendRawReplyMessage() {
      const data = {
        channelId: this.apx.data.currentChannelId,
        messageId: this.apx.data.textInput.replyingTo,
        data: JSON.stringify(this.apx.data.textInput.message),
      };
      console.log("Sending raw reply message", data);
      invoke("discord_raw_reply", data)
        .then((data) => {
          console.log("[discord_raw_reply]", data);
          this.apx.data.textInput.replyingTo = null;
        })
        .catch((err) => {
          console.error("[discord_raw_reply]", err);
        });
    },
    sendRawEditMessage() {
      const data = {
        channelId: this.apx.data.currentChannelId,
        messageId: this.apx.data.textInput.editing,
        data: JSON.stringify(this.apx.data.textInput.message),
      };
      console.log("Sending raw edit message", data);
      invoke("discord_raw_edit", data)
        .then((data) => {
          console.log("[discord_raw_edit]", data);
          this.apx.data.textInput.editing = null;
        })
        .catch((err) => {
          console.error("[discord_raw_edit]", err);
        });
    },
  },
  computed: {
    messages() {
      return this.apx.data.messages.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    },
    getReplyingToMessage() {
      if (!this.apx.data.textInput.replyingTo) return null;

      let msg = this.apx.data.messages.find((msg) => msg.id === this.apx.data.textInput.replyingTo);
      return msg;
    },
    getEditingMessage() {
      if (!this.apx.data.textInput.editing) return null;

      let msg = this.apx.data.messages.find((msg) => msg.id === this.apx.data.textInput.editing);
      return msg;
    },
  },
};
</script>
