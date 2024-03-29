<template>
  <div class="channels-navigation-wrapper">
    <div
      class="channel"
      :class="{
        active: apx.data.currentChannelId === channel.id,
      }"
      @click="handleClick(channel)"
      v-for="channel in sortedChannels"
    >
      {{ channel.name }}
    </div>
  </div>
</template>

<script>
import { getMessages } from "../../core/discord/api";
import { useAppStore } from "../../stores/app";
import ArrowIcon from "../icons/ArrowIcon.vue";

export default {
  components: { ArrowIcon },
  data() {
    return {
      apx: useAppStore(),
    };
  },
  methods: {
    handleClick(channel) {
      this.apx.data.currentChannel = channel;
      this.apx.data.currentChannelId = channel.id;
      this.apx.data.messages = this.apx.cache.cachedChannels[channel.id];
      this.$router.push(`/dms/${this.apx.data.currentServerId}/${channel.id}`);
      getMessages(channel.id);
    },
  },
  computed: {
    sortedChannels() {
      return this.apx.data.channels;
    },
  },
};
</script>
