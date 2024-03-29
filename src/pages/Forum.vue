<style lang="scss" scoped>
@mixin disableDefaultButton {
  border: none;
  color: var(--text-color);
  background-color: var(--button-color);
  border-radius: var(--radius-md);
  cursor: pointer;
}

#forum_wrapper {
  height: 100%;
  display: grid;
  grid-template-rows: 40px auto;
}

.channel-info {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  padding: 2px;
  border-bottom: 1px solid var(--button-color);
  margin-bottom: 10px;

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

.threads {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  gap: var(--gap-md);
  height: 100%;
  overflow: auto;

  .forum-thread {
    display: grid;
    place-items: center;
    width: 220px;
    height: 220px;
    transition: all 150ms;
    background-color: var(--button-color-muted);
    border-radius: var(--radius-md);
    font-size: 1.6rem;
    cursor: pointer;

    &:hover {
      background-color: var(--button-color);
    }
  }
}
</style>

<template>
  <div id="forum_wrapper">
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
    <div class="threads">
      <div class="forum-thread" v-for="thread in apx.data.forums.threads" @click="handleClick(thread)">
        {{ thread.name }}
      </div>
    </div>
  </div>
</template>

<script>
import { getMessages } from "../core/discord/api.js";
import { useAppStore } from "../stores/app.js";
import LoadingIcon from "../components/icons/LoadingIcon.vue";
import ShowLayoutIcon from "../components/icons/ShowLayoutIcon.vue";
export default {
  components: { LoadingIcon, ShowLayoutIcon },
  data() {
    return {
      apx: useAppStore(),
    };
  },
  methods: {
    handleClick(channel) {
      if (this.apx.buffer.loadingMessages) return;
      this.apx.data.currentChannel = channel;
      this.apx.data.currentChannelId = channel.id;
      this.apx.data.messages = this.apx.cache.cachedMessages[channel.id] || [];
      this.$router.push(`/server/${this.apx.data.currentServerId}/${channel.id}`);
      getMessages(channel.id);
    },
  },
};
</script>
