<style lang="scss" scoped>
.message-input-context-wrapper {
  --_button-height: 30px;

  position: absolute;
  display: flex;
  flex-flow: column nowrap;
  gap: var(--gap-sm);
  background: var(--button-color-muted);
  color: var(--text-color);
  padding: var(--gap-md);
  border-radius: var(--radius-md);
  z-index: 679;
  right: var(--gap-md);
  top: calc((3 * var(--_button-height)) * -1 - (var(--gap-md) * 3));

  .message-input-context {
    height: var(--_button-height);
    background-color: var(--button-color);
    border-radius: var(--radius-sm);
    padding: 5px;
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
  <div class="message-input-context-wrapper">
    <div class="message-input-context embed-creator">
      <div class="menu-button" @click="handleCreateEmbed"><span>Embed editor</span> <CodeIcon /></div>
    </div>
    <div class="message-input-context attach-file">
      <div class="menu-button"><span>Attach file</span> <ReactionEmojiIcon /></div>
    </div>
    <div class="message-input-context create-thread">
      <div class="menu-button"><span>Create thread</span> <ReactionEmojiIcon /></div>
    </div>
  </div>
</template>

<script>
import ReactionEmojiIcon from "../icons/ReactionEmojiIcon.vue";
import CodeIcon from "../icons/CodeIcon.vue";
import { useAppStore } from "../../stores/app";

export default {
  name: "MessageContextMenu",
  components: { ReactionEmojiIcon, CodeIcon },
  data() {
    return {
      apx: useAppStore(),
    };
  },
  methods: {
    handleCreateEmbed() {
      this.$router.push(`/embed/${this.apx.data.currentServerId}/${this.apx.data.currentChannelId}`);
    },
  },
};
</script>
