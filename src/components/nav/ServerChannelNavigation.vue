<style lang="scss" scoped>
.channels-navigation-wrapper {
  position: relative;
  height: 100%;
  width: calc(
    var(--_fullNavWidth) - var(--_leftNavWidth) - var(--gap-md) - 2 *
      var(--gap-sm)
  );
  display: flex;
  flex-flow: column nowrap;
  gap: var(--gap-sm);
  background-color: inherit;
  overflow-x: hidden;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }
}

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

header {
  position: sticky;
  top: 0;
  background-color: inherit;
  padding-top: var(--gap-sm);
  padding-bottom: var(--gap-sm);
  user-select: none;
  cursor: pointer;
  z-index: 60;

  h1 {
    margin: 0;
    font-size: 1.2rem;
    white-space: nowrap;
  }
}

.server-info {
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  border-bottom: 1px solid var(--text-color);
  padding-bottom: var(--gap-sm);

  .server-edit-navigation {
    position: absolute;
    top: var(--gap-sm);
    right: var(--gap-sm);
    display: flex;
    flex-flow: row nowrap;
    gap: var(--gap-sm);

    button {
      display: grid;
      place-items: center;
      width: 20px;
      height: 20px;
      background-color: var(--button-color);
      color: var(--text-color);
      border: none;
      border-radius: var(--radius-sm);
      padding: unset;
      cursor: pointer;
    }
  }
}

.loading-default {
  font-size: 2.1rem;
  z-index: 365;
}
</style>

<template>
  <div class="channels-navigation-wrapper">
    <div class="loading-default" v-if="apx.buffer.loadingChannels">
      <LoadingIcon :animated="true" />
    </div>
    <header
      v-if="apx.data.currentServer"
      @click="$router.push(`/server/${apx.data.currentServerId}`)"
    >
      <h1>{{ apx.data.currentServer.name }}</h1>
    </header>
    <div class="server-info" v-if="apx.data.currentServer">
      <div class="server-edit-navigation">
        <button id="EditChannels"><EditIcon /></button>
        <button id="ServerSettings"><SettingsIcon /></button>
      </div>
      <img v-if="apx.data.currentServer.banner" />
      <img
        v-else-if="apx.data.currentServer.splash"
        :src="`https://cdn.discordapp.com/splashes/${apx.data.currentServer.id}/${apx.data.currentServer.splash}.jpg?size=256`"
      />
    </div>
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
      v-for="channel in sortedChannels"
    >
      <span v-if="channel.type === 4"
        ><ArrowIcon
          :class="{ 'closed-category': hiddenCategories.includes(channel.id) }"
      /></span>
      {{ channel.name }}
    </div>
  </div>
</template>

<script>
import { getForums, getMessages } from "../../core/discord/api";
import { useAppStore } from "../../stores/app";
import ArrowIcon from "../icons/ArrowIcon.vue";
import LoadingIcon from "../icons/LoadingIcon.vue";
import EditIcon from "../icons/EditIcon.vue";
import SettingsIcon from "../icons/SettingsIcon.vue";

export default {
  components: { ArrowIcon, LoadingIcon, EditIcon, SettingsIcon },
  data() {
    return {
      apx: useAppStore(),
      hiddenCategories: [],
    };
  },
  methods: {
    handleClick(channel) {
      console.log("Loading channel", channel.type, channel.id);
      switch (channel.type) {
        case 4: {
          const existingHiddenCategoryIndex = this.hiddenCategories.findIndex(
            (el) => el === channel.id
          );
          if (existingHiddenCategoryIndex !== -1) {
            this.hiddenCategories.splice(existingHiddenCategoryIndex, 1);
          } else {
            this.hiddenCategories.push(channel.id);
          }
          break;
        }
        case 15: {
          if (this.apx.buffer.loadingChannels) return;
          this.apx.data.currentChannel = channel;
          this.apx.data.currentChannelId = channel.id;
          this.$router.push(
            `/forum/${this.apx.data.currentServerId}/${channel.id}`
          );
          getForums(channel.id);
          break;
        }
        default: {
          if (this.apx.buffer.loadingMessages) return;
          this.apx.data.currentChannel = channel;
          this.apx.data.currentChannelId = channel.id;
          this.apx.data.messages =
            this.apx.cache.cachedMessages[channel.id] || [];
          this.$router.push(
            `/server/${this.apx.data.currentServerId}/${channel.id}`
          );
          getMessages(channel.id);
          break;
        }
      }
    },
  },
  computed: {
    sortedChannels() {
      {
        const sortedChannels = [];
        const parrents = [];
        useAppStore().data.channels.forEach((channel) => {
          if (channel.type === 4)
            parrents.push({
              id: channel.id,
              name: channel.name,
              type: channel.type,
              position: channel.position,
              childs: [],
            });
        });
        useAppStore().data.channels.forEach((channel) => {
          if (channel.parent_id) {
            const parrent = parrents.find((e) => e.id == channel.parent_id);
            if (parrent) {
              if (!parrent.childs) {
                parrent.childs = [];
              }
              parrent.childs.push(channel);
            }
          } else if (channel.type !== 4) {
            sortedChannels.push(channel);
          }
        });
        sortedChannels.sort((a, b) => a.position - b.position);
        parrents.sort((a, b) => a.position - b.position);

        parrents.forEach((parent) => {
          sortedChannels.push(parent);
          if (parent.childs) {
            parent.childs.sort((a, b) => a.position - b.position);

            parent.childs.forEach((child) => {
              sortedChannels.push(child);
            });
          }
        });

        return sortedChannels;
      }
    },
  },
};
</script>
