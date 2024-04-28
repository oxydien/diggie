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

    button {
      height: calc(100% - var(--gap-sm));
      margin-top: var(--gap-sm);
      border-radius: var(--radius-sm);

      &:hover {
        background-color: var(--primary-muted-color);
        color: var(--text-button-color) !important;
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
        <Textarea
          ref="mainChatInput"
          @keypress.enter="sendMessageEnter"
          placeholder="Message here..."
          v-model="apx.data.textInput.message.content"
        />
        <Button @click="showMoreContextMenu = !showMoreContextMenu">...</Button>
        <Button @click="sendMessageClick"><SendIcon /></Button>
      </div>
    </div>
  </div>
</template>

<script>
import { useAppStore } from "../stores/app";
import { invoke } from "@tauri-apps/api/core";
import {
	sendRawMessage,
	sendRawReplyMessage,
	sendRawEditMessage,
} from "../core/discord/messages.js";
import ReplyIcon from "../components/icons/ReplyIcon.vue";
import SendIcon from "../components/icons/SendIcon.vue";
import ShowLayoutIcon from "../components/icons/ShowLayoutIcon.vue";
import Message from "../components/message/Message.vue";
import MsgInputMoreMenu from "../components/message/MsgInputMoreMenu.vue";
import LoadingIcon from "../components/icons/LoadingIcon.vue";
import Attachments from "../components/message/Attachments.vue";
import Textarea from "../components/base/Textarea.vue";
import Button from "../components/base/Button.vue";

export default {
	components: {
		ReplyIcon,
		Attachments,
		SendIcon,
		ShowLayoutIcon,
		Message,
		MsgInputMoreMenu,
		LoadingIcon,
		Textarea,
		Button,
	},
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
		"apx.data.currentChannelId"(newVal) {
			const index = this.apx.data.unreadChannels.findIndex(
				(el) => el === newVal,
			);
			if (index !== -1) {
				this.apx.data.unreadChannels.splice(index, 1);
			}
		},
	},
	mounted() {
		const index = this.apx.data.unreadChannels.findIndex(
			(el) => el === this.apx.data.currentChannelId,
		);
		if (index !== -1) {
			this.apx.data.unreadChannels = this.apx.data.unreadChannels.splice(
				index,
				1,
			);
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
				if (
					message ||
					(this.apx.data.textInput.message.embeds &&
						this.apx.data.textInput.message.embeds.length > 0)
				) {
					console.log(ev, message);
					this.sendRawMessage();
					inputEl.value = "";
					this.apx.data.textInput.message.content = "";
					inputEl.rows = 1;
				}
			}
		},
		sendMessageEnter(ev) {
			if (ev.shiftKey) return;
			ev.preventDefault();
			const inputEl = this.$refs.mainChatInput;
			if (inputEl) {
				const message = inputEl.value.trim();
				console.log(ev, message);
				if (
					message ||
					(this.apx.data.textInput.message.embeds &&
						this.apx.data.textInput.message.embeds.length > 0)
				) {
					this.sendRawMessage();
					inputEl.value = "";
					this.apx.data.textInput.message.content = "";
					inputEl.rows = 1;
				}
			}
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
			sendRawMessage(
				this.apx.data.currentChannelId,
				JSON.stringify(this.apx.data.textInput.message),
			);
		},
		sendRawReplyMessage() {
			sendRawReplyMessage(
				this.apx.data.currentChannelId,
				this.apx.data.textInput.replyingTo,
				JSON.stringify(this.apx.data.textInput.message),
			);
		},
		sendRawEditMessage() {
			sendRawEditMessage(
				this.apx.data.currentChannelId,
				this.apx.data.textInput.editing,
				JSON.stringify(this.apx.data.textInput.message),
			);
		},
	},
	computed: {
		messages() {
			return this.apx.data.messages.sort((a, b) =>
				a.timestamp.localeCompare(b.timestamp),
			);
		},
		getReplyingToMessage() {
			if (!this.apx.data.textInput.replyingTo) return null;

			const msg = this.apx.data.messages.find(
				(msg) => msg.id === this.apx.data.textInput.replyingTo,
			);
			return msg;
		},
		getEditingMessage() {
			if (!this.apx.data.textInput.editing) return null;

			const msg = this.apx.data.messages.find(
				(msg) => msg.id === this.apx.data.textInput.editing,
			);
			return msg;
		},
	},
};
</script>
