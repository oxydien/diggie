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

#guild_info_wrapper {
  text-align: center;
  height: 100%;
  overflow-y: auto;

  .header {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    padding: 2px;
    border-bottom: 1px solid var(--button-color);

    .server-small {
      display: flex;
      flex-flow: row nowrap;
      gap: var(--gap-sm);

      img {
        width: 36px;
        height: 36px;
      }

      h2 {
        width: fit-content;
        margin: 3px 0;
      }
    }

    button {
      @include disableDefaultButton();
      display: grid;
      aspect-ratio: 1/1;
      place-items: center;
      font-size: 1.4rem;
      height: 100%;
      border-radius: var(--radius-sm);
      transform: rotate(180deg);
    }
  }
}
</style>

<template>
  <div id="guild_info_wrapper">
    <div class="loading-default" v-if="apx.buffer.loadingGuildInfo">
      <LoadingIcon :animated="true" />
    </div>
    <div class="header">
      <div class="server-small">
        <img
          v-if="apx.data.currentServer"
          :src="`https://cdn.discordapp.com/icons/${apx.data.currentServer.id}/${apx.data.currentServer.icon}.webp?size=40`"
        />
        <h2>{{ apx.data.currentServer ? apx.data.currentServer.name : "" }}</h2>
      </div>
      <button @click="apx.layout.showMembers = !apx.layout.showMembers">
        <ShowLayoutIcon :show="apx.layout.showMembers" />
      </button>
    </div>
    <div class="content">
      <h4>Server roles</h4>
      <div class="roles">
        <div
          class="role"
          v-if="apx.data.currentServer && apx.data.currentServer.roles"
          :style="`color: #${role.color}`"
          v-for="role in apx.data.currentServer.roles"
        >
          {{ role.color }} - {{ role.name }} - {{ role.position }}
        </div>
      </div>
      <!-- {{ apx.data.currentServer }} -->
    </div>
  </div>
</template>

<script>
import { useAppStore } from "../stores/app";
import LoadingIcon from "../components/icons/LoadingIcon.vue";
import ShowLayoutIcon from "../components/icons/ShowLayoutIcon.vue";

export default {
  components: { LoadingIcon, ShowLayoutIcon },
  data() {
    return {
      apx: useAppStore(),
    };
  },
};
</script>
