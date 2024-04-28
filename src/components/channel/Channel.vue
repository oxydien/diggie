<style lang="scss" scoped>
.channel-wrapper {
  position: relative;
}

.channel {
  display: grid;
  grid-template-columns: auto;
  place-items: center;
  justify-items: start;
  width: 100%;
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

  span {
    max-width: 100%;
  }

  &.active {
    background-color: var(--primary-muted-color);
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
  .closed-category {
    rotate: -90deg;
  }
}

.edit-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: var(--gap-sm);
  display: inline-block;
  height: fit-content;
  aspect-ratio: 1/1;
  padding: 2px;
  border-radius: 2px;
  cursor: pointer;
  z-index: 12;

  &:hover {
    background-color: var(--foreground-color);
  }
}
</style>

<template>
  <div class="channel-wrapper" @contextmenu="showContextMenu($event)">
    <div
      class="channel"
      :class="{
        'guild-text-channel': channel.type === 0,
        'guild-voice-channel': channel.type === 2,
        'guild-category': channel.type === 4,
        'guild-annoucement': channel.type === 5,
        'guild-forum': channel.type === 15,
        editing: editing,
        active: apx.data.currentChannelId === channel.id,
        unread: apx.data.unreadChannels.includes(channel.id),
      }"
      v-show="!hiddenCategories.includes(channel.parent_id)"
      @click="handleClick(channel)"
    >
      <em v-if="channel.type === 4"
        ><ArrowIcon :class="{ 'closed-category': hiddenCategories.includes(channel.id) }"
      /></em>
      <span>
        {{ channel.name }}
      </span>
    </div>
    <strong class="edit-button" v-if="editing" @click="handleEdit">
      <SettingsIcon />
    </strong>
  </div>
</template>

<script>
import { useAppStore } from "../../stores/app";
import ArrowIcon from "../icons/ArrowIcon.vue";
import SettingsIcon from "../icons/SettingsIcon.vue";
import { createApp } from "vue";
export default {
  components: { ArrowIcon, SettingsIcon },
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
    handleEdit() {
      this.$emit("edit", this.channel);
    },
    async showContextMenu(event) {
      if (this.ignoreContextMenu == true) return;
      event.preventDefault(); // Prevent default right-click menu

      if (this.apx.data.currentChannelContextMenu) {
        this.apx.data.currentChannelContextMenu.remove();
      }

      const loadAndMountComponent = async () => {
        const { default: ChannelContextMenu } = await import("./ChannelContextMenu.vue");
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
