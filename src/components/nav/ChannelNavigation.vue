<style lang="scss" scoped>
.channels-navigation-wrapper {
  position: relative;
  height: 100%;
  width: var(--_rightNavWidth);
  display: flex;
  flex-flow: column nowrap;
  background-color: inherit;
  overflow-x: hidden;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }

  .channel-shell {
    margin-top: var(--gap-sm);
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
    <Channel :channel="channel" :hiddenCategories="hiddenCategories" :editing="apx.layout.channelEditMode"
      :key="hiddenCategories" v-for="channel in sortedChannels" @clicked="handleClick" @edit="handleEdit" />
  </div>
</template>

<script>
import { getForums, loadChannel } from "../../core/discord/channels";
import { useAppStore } from "../../stores/app";
import LoadingIcon from "../icons/LoadingIcon.vue";
import Channel from "../channel/Channel.vue";
import Button from "../base/Button.vue";

export default {
  components: {
    Channel,
    LoadingIcon,
    Button,
  },
  data() {
    return {
      apx: useAppStore(),
      hiddenCategories: [],
    };
  },
  methods: {
    handleClick(channel) {
      if (channel.type === 4) {
        const existingHiddenCategoryIndex = this.hiddenCategories.findIndex(
          (el) => el === channel.id,
        );
        if (existingHiddenCategoryIndex !== -1) {
          this.hiddenCategories.splice(existingHiddenCategoryIndex, 1);
        } else {
          this.hiddenCategories.push(channel.id);
        }
        return;
      }

      loadChannel(channel);
    },
    handleEdit(channel) {
      this.apx.data.currentChannel = channel;
      this.$router.push(
        `/server/${this.apx.data.currentServerId}/edit/${channel.id}`,
      );
    },
  },
  computed: {
    sortedChannels() {
      {
        const sortedChannels = [];
        const parrents = [];
        const channels = useAppStore().data.channels;
        for (let i = 0; i < channels.length; i++) {
          const channel = channels[i];
          if (channel.type === 4)
            parrents.push({
              id: channel.id,
              name: channel.name,
              type: channel.type,
              position: channel.position,
              childs: [],
            });
        }
        for (const channel of useAppStore().data.channels) {
          if (channel.parent_id) {
            const parrent = parrents.find((e) => e.id === channel.parent_id);
            if (parrent) {
              if (!parrent.childs) {
                parrent.childs = [];
              }
              parrent.childs.push(channel);
            }
          } else if (channel.type !== 4) {
            sortedChannels.push(channel);
          }
        }
        sortedChannels.sort((a, b) => a.position - b.position);
        parrents.sort((a, b) => a.position - b.position);

        for (let i = 0; i < parrents.length; i++) {
          const parent = parrents[i];
          sortedChannels.push(parent);

          if (parent.childs) {
            parent.childs.sort((a, b) => {
              if (a.type === 2 && b.type !== 2) return 1;
              if (a.type !== 2 && b.type === 2) return -1;
              return a.position - b.position;
            });

            for (let j = 0; j < parent.childs.length; j++) {
              sortedChannels.push(parent.childs[j]);
            }
          }
        }

        return sortedChannels;
      }
    },
  },
};
</script>
