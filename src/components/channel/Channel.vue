<style lang="scss" scoped>
.channel {
  transition: all 120ms;
  background-color: var(--button-color-muted);
  border-radius: var(--radius-sm);
  padding: 2px var(--gap-sm);
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;

  &:hover {
    background-color: var(--button-color);
  }
  &.active {
    background-color: var(--primary-muted-color);
  }

  &.guild-category {
    background-color: initial;
    padding: 4px 0 0 0;
  }
  &.unread {
    color: var(--text-highlight-color);
    border-left: 3px solid var(--text-highlight-color);
  }
  .closed-category {
    rotate: -90deg;
  }
}
</style>

<template>
  <div
    class="channel"
    :class="{
      'guild-text-channel': channel.type === 0,
      'guild-voice-channel': channel.type === 2,
      'guild-category': channel.type === 4,
      'guild-annoucement': channel.type === 5,
      'guild-forum': channel.type === 15,
      active: apx.data.currentChannelId === channel.id,
      unread: apx.data.unreadChannels.includes(channel.id),
    }"
    v-show="!hiddenCategories.includes(channel.parent_id)"
    @click="handleClick(channel)"
  >
    <span v-if="channel.type === 4"
      ><ArrowIcon
        :class="{ 'closed-category': hiddenCategories.includes(channel.id) }"
    /></span>
    {{ channel.name }}
  </div>
</template>

<script>
import { useAppStore } from "../../stores/app";
import ArrowIcon from "../icons/ArrowIcon.vue";
export default {
  components: { ArrowIcon },
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
    hiddenCategories: {
      type: Array,
      required: true,
    },
  },
  emits: ["clicked"],
  methods: {
    handleClick(channel) {
      this.$emit("clicked", channel);
    },
  },
};
</script>
