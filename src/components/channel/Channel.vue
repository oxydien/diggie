<style lang="scss" scoped>
.channel-wrapper {
  --_channel-height: 38px;
  --_channel-width: var(--_rightNavWidth);

  position: relative;

  &:not(:first-child) {
    margin-top: var(--gap-sm);
  }
}

.channel {
  --_icon-size: 12px;

  display: grid;
  grid-template-columns: var(--_icon-size) calc(var(--_channel-width) - var(--_icon-size) - var(--gap-sm));
  place-items: center;
  justify-items: start;
  gap: var(--gap-sm);

  width: var(--_channel-width);
  height: var(--_channel-height);
  transition: all 120ms;
  background-color: var(--alternate-foreground-color);
  border-radius: var(--radius-sm);
  padding: 4px var(--gap-sm);
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;

  &:hover {
    background-color: var(--button-color);
  }

  &.editing {
    grid-template-columns: var(--_icon-size) calc(var(--_channel-width) - var(--_icon-size) - var(--gap-sm)) 24px;
  }

  span {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    max-width: 100%;
  }

  &.active {
    background-color: var(--primary-muted-color);
    color: var(--text-highlight-color);
    font-weight: 600;
  }

  &.guild-category {
    grid-template-columns: 20px auto;
    background-color: initial;
    padding: 4px 0 0 0;
  }

  &.unread {
    color: var(--text-highlight-color);
    border-left: 3px solid var(--text-highlight-color);
  }

  .category-icon {
    transition: all 120ms;
  }

  .closed-category {
    rotate: -90deg;
  }

  .channel-icon {
    margin-top: var(--gap-sm);
    font-size: 0.9rem;
    height: fit-content;
  }
}

.edit-button {
  position: absolute;
  top: 0;
  right: 0;
  height: var(--_channel-height);
  width: fit-content !important;
  padding: 4px !important;
  z-index: 12;
}
</style>

<template>
  <div class="channel-wrapper" v-show="!hiddenCategories.includes(channel.parent_id)"
    @contextmenu="showContextMenu($event)">
    <div class="channel" :class="{
      'guild-text-channel': channel.type === 0,
      'guild-voice-channel': channel.type === 2,
      'guild-category': channel.type === 4,
      'guild-annoucement': channel.type === 5,
      'guild-forum': channel.type === 15,
      editing: editing,
      active: apx.data.currentChannelId === channel.id,
      unread: apx.data.unreadChannels.includes(channel.id),
    }" @click="handleClick(channel)">
      <div class="channel-icon" v-if="channel.type !== 4">
        <AutoChannelIcon :channelType="channel.type" />
      </div>
      <em v-else>
        <ArrowIcon class="category-icon" :class="{ 'closed-category': hiddenCategories.includes(channel.id) }" />
      </em>
      <span class="channel-name">
        {{ channel.name }}
      </span>

      <Button class="edit-button" v-if="editing" @click="handleEdit">
        <EditIcon />
      </Button>
    </div>
  </div>
</template>

<script>
import { useAppStore } from "../../stores/app";
import ArrowIcon from "../icons/ArrowIcon.vue";
import EditIcon from "../icons/EditIcon.vue";
import Button from "../base/Button.vue";
import AutoChannelIcon from "../icons/AutoChannelIcon.vue";
import { createApp } from "vue";
export default {
  components: {
    ArrowIcon,
    EditIcon,
    AutoChannelIcon,
    Button,
  },
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
    editing: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["clicked", "edit"],
  methods: {
    handleClick(channel) {
      this.$emit("clicked", channel);
    },
    handleEdit(ev = null) {
      ev?.stopPropagation();
      this.$emit("edit", this.channel);
    },
    async showContextMenu(event) {
      if (this.ignoreContextMenu === true) return;
      event.preventDefault(); // Prevent default right-click menu

      if (this.apx.data.currentChannelContextMenu) {
        this.apx.data.currentChannelContextMenu.remove();
      }

      const loadAndMountComponent = async () => {
        const { default: ChannelContextMenu } = await import(
          "./ChannelContextMenu.vue"
        );
        const contextMenu = createApp(ChannelContextMenu, {
          channel: this.channel,
          editCallback: this.handleEdit,
        }).mount(document.createElement("div"));

        // Position the context menu
        contextMenu.$el.style.left = `${event.clientX}px`;
        contextMenu.$el.style.top = `${event.clientY}px`;

        // Append the context menu to the body
        document.body.appendChild(contextMenu.$el);

        window.addEventListener("click", this.hideContextMenu, { once: true });

        this.apx.data.currentChannelContextMenu = contextMenu.$el;
      };

      await loadAndMountComponent();
    },
    hideContextMenu(event) {
      if (this.apx.data.currentChannelContextMenu) {
        this.apx.data.currentChannelContextMenu.remove();
        this.apx.data.currentChannelContextMenu = null;
      }
    },
  },
};
</script>
