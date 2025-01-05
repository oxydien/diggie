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

	.channel-header {
		display: flex;
		gap: var(--gap-sm);
		align-items: center;

		.channel-name {
			display: flex;
			gap: var(--gap-sm);

			.icon {
				margin-top: var(--gap-sm);
			}
		}

		button {
			height: calc(100% - var(--gap-sm));
		}
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

	&> :last-child {
		padding-bottom: 2rem;
	}
}

.chat-inputs-wrapper {
	position: relative;

	.editing,
	.replies {
		display: flex;
		flex-flow: row nowrap;
		gap: var(--gap-sm);
		align-items: center;
		justify-content: space-between;
		padding: var(--gap-sm);
		border-top: 1px solid var(--button-color);
		cursor: pointer;
	}

	.chat-inputs {
		display: grid;
		align-items: center;
		grid-template-columns: 100fr 40px 40px auto;
		gap: var(--gap-sm);

		.message-input {
			padding-top: var(--gap-md);
		}

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

		<!-- Channel info -->
		<div class="channel-info">
			<div class="channel-header">
				<Button iconOnly @click="goBackChannel" v-if="showGoBackButton">
					<ArrowIcon style="transform: rotate(-90deg)" />
				</Button>
				<LoadingIcon v-if="apx.buffer.loadingMessages" />
				<div class="channel-name">
					<div class="icon" v-if="typeof apx.data.currentChannel?.type === 'number'">
						<AutoChannelIcon :channelType="apx.data.currentChannel.type" />
					</div>
					{{
						apx.data.currentChannel ? apx.data.currentChannel.name : ""
					}}
				</div>
			</div>

			<button @click="apx.layout.showMembers = !apx.layout.showMembers">
				<ShowLayoutIcon :show="apx.layout.showMembers" />
			</button>
		</div>

		<!-- Messages -->
		<div class="chat-contents" ref="chatContentWrapper" @wheel.passive="handleScroll">
			<div class="message-wrapper" :class="{ 'has-reply': message.message_reference }"
				v-for="(message, index) in messages" :ref="index === messages.length - 1 ? 'LastMessage' : null">
				<Message :message="message" :key="message.id" :previousMessage="messages[index - 1] || null" />
			</div>
			<div class="chat-bottom" ref="chatBottom"></div>
		</div>

		<!-- Inputs -->
		<div class="chat-inputs-wrapper">
			<MsgInputMoreMenu v-if="showMoreContextMenu" />
			<div class="replies" v-if="apx.data.textInput.replyingTo" @click="cancelReplying" tabindex="0"
				@keydown.enter="cancelReplying" title="Cancel reply">
				<span>
					Replying to
					<strong>{{ getReplyingToMessage.author.global_name || getReplyingToMessage.author.username }}</strong>
				</span>
				<CloseIcon />
			</div>
			<div class="editing" v-if="apx.data.textInput.editing" @click="cancelEditing" tabindex="0"
				@keydown.enter="cancelEditing" title="Cancel editing">
				<span>Editing
					<strong>{{ apx.data.textInput.editing }}</strong>
				</span>
				<CloseIcon />
			</div>
			<div class="attachments">
				<Attachments />
			</div>
			<div class="chat-inputs">
				<Textarea id="mainChatInput" class="message-input" @keypress.enter="sendMessageEnter"
					placeholder="Message here..." v-model="apx.data.textInput.message.content" />
				<Button @click="showMoreContextMenu = !showMoreContextMenu">...</Button>
				<Button @click="sendMessageClick">
					<SendIcon />
				</Button>
			</div>
		</div>
	</div>
</template>

<script>
import { useAppStore } from "../stores/app";
import {
	sendRawMessage,
	sendRawReplyMessage,
	sendRawEditMessage,
} from "../core/discord/messages.js";
import { loadChannel, loadFromChannelId } from "../core/discord/channels";
import ReplyIcon from "../components/icons/ReplyIcon.vue";
import SendIcon from "../components/icons/SendIcon.vue";
import ShowLayoutIcon from "../components/icons/ShowLayoutIcon.vue";
import Message from "../components/message/Message.vue";
import MsgInputMoreMenu from "../components/message/MsgInputMoreMenu.vue";
import LoadingIcon from "../components/icons/LoadingIcon.vue";
import Attachments from "../components/message/Attachments.vue";
import Textarea from "../components/base/Textarea.vue";
import CloseIcon from "../components/icons/CloseIcon.vue";
import Button from "../components/base/Button.vue";
import AutoChannelIcon from "../components/icons/AutoChannelIcon.vue";
import ArrowIcon from "../components/icons/ArrowIcon.vue";

export default {
	components: {
		ReplyIcon,
		Attachments,
		SendIcon,
		ShowLayoutIcon,
		Message,
		CloseIcon,
		MsgInputMoreMenu,
		LoadingIcon,
		Textarea,
		Button,
		ArrowIcon,
		AutoChannelIcon,
	},
	data() {
		return {
			apx: useAppStore(),
			showMoreContextMenu: false,
			userScrolled: false,
			scrollInterval: null,
		};
	},
	watch: {
		"apx.data.messages"() {
			this.scrollBottom();
		},
		"apx.data.currentChannelId"(newVal) {
			console.log("Loading new channel", newVal);
			this.resetScrollLoop();

			const index = this.apx.data.unreadChannels.findIndex(
				(el) => el === newVal,
			);
			if (index !== -1) {
				this.apx.data.unreadChannels.splice(index, 1);
			}
		},
		"apx.data.textInput.replyingTo"() {
			this.focusInput();
		},
		"apx.data.textInput.editing"() {
			this.focusInput();
		},
		"apx.data.textInput.message.content"(newVal) {
			const inputEl = this.getMainChatInput();
			if (inputEl) {
				inputEl.value = newVal;
			}
		},

		"apx.user"() {
			this.tryFixPage();
		},
	},
	mounted() {
		this.resetScrollLoop();
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
	beforeUnmount() {
		clearInterval(this.scrollInterval);
	},
	methods: {
		handleScroll() {
			this.userScrolled = true;
		},
		resetScrollLoop() {
			this.userScrolled = false;
			clearInterval(this.scrollInterval);
			this.scrollLoop();
		},
		scrollLoop() {
			if (!this.apx.data.currentChannel) {
				return;
			}
			// Until the user has scrolled, scroll to the bottom
			this.scrollInterval = setInterval(() => {
				if (this.userScrolled === true) {
					clearInterval(this.scrollInterval);
					return;
				}
				this.scrollBottom();
			}, 200);
		},
		scrollBottom() {
			const chatBottom = this.$refs.chatBottom;
			if (chatBottom) {
				chatBottom.scrollIntoView({
					behavior: "smooth",
				});
			}
		},

		tryFixPage() {
			loadFromChannelId(this.$route.params.channelId);
		},

		// Inputs
		// TODO: Move to separate component
		getMainChatInput() {
			return document.getElementById("mainChatInput");
		},
		focusInput() {
			const inputEl = this.getMainChatInput();
			if (inputEl) {
				console.log("Focus input", inputEl);
				inputEl.focus();
			}
		},
		cancelReplying() {
			this.apx.data.textInput.replyingTo = null;
		},
		cancelEditing() {
			this.apx.data.textInput.editing = null;
		},
		sendMessageClick(ev) {
			const inputEl = this.getMainChatInput();
			if (inputEl) {
				console.log(ev, inputEl);
				const message = inputEl.value.trim();
				if (
					message ||
					(this.apx.data.textInput.message.embeds &&
						this.apx.data.textInput.message.embeds.length > 0)
				) {
					console.log(ev, message);
					this.sendRawMessage();
					this.apx.data.textInput.message.content = "";
					inputEl.rows = 1;
				}
			}
		},
		sendMessageEnter(ev) {
			if (ev.shiftKey) return;
			ev.preventDefault();
			const inputEl = this.getMainChatInput();
			if (inputEl) {
				const message = inputEl.value.trim();
				console.log(ev, message);
				if (
					message ||
					(this.apx.data.textInput.message.embeds &&
						this.apx.data.textInput.message.embeds.length > 0)
				) {
					this.sendRawMessage();
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
		goBackChannel() {
			this.apx.data.channelHistory.pop();
			const lastChannelId =
				this.apx.data.channelHistory[this.apx.data.channelHistory.length - 1];
			const lastChannel = this.apx.cache.cachedChannels[
				this.apx.data.currentServerId
			].find((channel) => channel.id === lastChannelId);
			if (lastChannel) {
				loadChannel(lastChannel);
			}
		},
	},
	computed: {
		messages() {
			// cmt: love that discord doesn't sort messages by default
			return this.apx.data.messages.sort((a, b) =>
				a.timestamp.localeCompare(b.timestamp),
			);
		},
		// Inputs
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
		// Header
		showGoBackButton() {
			// If last channel was a forum channel
			if (this.apx.data.channelHistory < 2) return false;
			if (!this.apx.cache.cachedChannels[this.apx.data.currentServerId])
				return false;

			const lastChannelId =
				this.apx.data.channelHistory[this.apx.data.channelHistory.length - 2];
			const lastChannel = this.apx.cache.cachedChannels[
				this.apx.data.currentServerId
			].find((channel) => channel.id === lastChannelId);
			console.log("lastChannel", lastChannel, this.apx.data.channelHistory);
			return lastChannel && lastChannel.type === 15;
		},
	},
};
</script>
