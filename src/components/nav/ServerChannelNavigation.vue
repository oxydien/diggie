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

header {
  position: sticky;
  top: 0;
  display: grid;
  grid-template-rows: 22px auto;
  width: 100%;
  background-color: inherit;
  padding-top: var(--gap-sm);
  padding-bottom: var(--gap-sm);
  user-select: none;
  cursor: pointer;
  z-index: 60;

  .server-info {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    width: calc(
      var(--_fullNavWidth) - var(--_leftNavWidth) - var(--gap-md) - 2 *
        var(--gap-sm)
    );
    button {
      display: grid;
      place-items: center;
      margin: 0;
      padding: 0 var(--gap-sm);
      color: var(--text-color);
      background-color: transparent;
      border: none;
      cursor: pointer;
    }
    h1 {
      width: 100%;
      margin: 0;
      font-size: 1.1rem;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
  .server-info-menu {
    display: flex;
    flex-flow: column nowrap;
    gap: var(--gap-sm);
    padding-top: var(--gap-md);
    button {
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-between;
      align-items: center;
      border: none;
      transition: all 150ms;
      color: var(--text-color);
      background-color: var(--button-color);
      border-radius: var(--radius-sm);
      padding: var(--gap-sm);
      font-weight: 600;
      cursor: pointer;

      &:hover {
        color: var(--text-highlight-color);
        background-color: var(--primary-muted-color);
      }
    }
  }
}

.server-banner {
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  border-bottom: 1px solid var(--text-color);
  padding-bottom: var(--gap-sm);
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
    <header v-if="apx.data.currentServer">
      <div class="server-info">
        <h1 @click="$router.push(`/server/${apx.data.currentServerId}`)">
          {{ apx.data.currentServer.name }}
        </h1>
        <button @click="serverInfoMenuOpen = !serverInfoMenuOpen">
          <ArrowIcon
            style="transition: all 150ms"
            :style="serverInfoMenuOpen ? '' : 'transform: rotate(-90deg)'"
          />
        </button>
      </div>
      <div class="server-info-menu" v-if="serverInfoMenuOpen">
        <button>
          <span>Server settings</span>
          <SettingsIcon style="transform: rotate(-90deg)" />
        </button>
        <button>
          <span>Edit channels</span>
          <EditIcon style="transform: rotate(-90deg)" />
        </button>
      </div>
    </header>
    <div class="server-banner" v-if="apx.data.currentServer">
      <img v-if="apx.data.currentServer.banner" />
      <img
        v-else-if="apx.data.currentServer.splash"
        :src="`https://cdn.discordapp.com/splashes/${apx.data.currentServer.id}/${apx.data.currentServer.splash}.jpg?size=256`"
      />
    </div>
    <Channel
      :channel="channel"
      :hiddenCategories="hiddenCategories"
      :key="hiddenCategories"
      v-for="channel in sortedChannels"
      @clicked="handleClick"
    />
  </div>
</template>

<script>
import { getForums, getMessages } from "../../core/discord/api";
import { useAppStore } from "../../stores/app";
import ArrowIcon from "../icons/ArrowIcon.vue";
import LoadingIcon from "../icons/LoadingIcon.vue";
import EditIcon from "../icons/EditIcon.vue";
import SettingsIcon from "../icons/SettingsIcon.vue";
import Channel from "../channel/Channel.vue";

export default {
  components: { Channel, ArrowIcon, LoadingIcon, EditIcon, SettingsIcon },
  data() {
    return {
      apx: useAppStore(),
      hiddenCategories: [],
      serverInfoMenuOpen: false,
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
