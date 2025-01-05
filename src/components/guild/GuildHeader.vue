<style lang="scss" scoped>
header {
  display: grid;
  grid-template-rows: 22px auto;
  padding: var(--gap-md);
  z-index: 60;

  .server-info {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    width: calc(var(--_rightNavWidth) - var(--gap-md));

    button {
      display: grid;
      place-items: center;
      margin: 0;
      padding: 0 var(--gap-sm);
      color: var(--text-color);
      background-color: transparent;
      border: none;
      cursor: pointer;

      &.active {
        color: var(--primary-color);
      }
    }

    h1 {
      width: 100%;
      margin: 0;
      font-size: 1.1rem;
      white-space: nowrap;
      text-overflow: ellipsis;
      padding-block: var(--gap-sm);
      cursor: pointer;
      overflow: hidden;
    }
  }

  .server-info-menu {
    display: flex;
    flex-flow: column nowrap;
    gap: var(--gap-sm);
    padding-top: var(--gap-md);

    button {
      justify-content: space-between;
      padding: var(--gap-md);
      font-weight: 600;
    }
  }
}

.server-banner {
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  padding-bottom: var(--gap-md);
  margin-bottom: var(--gap-sm);
}
</style>

<template>
  <header v-if="apx.data.currentServer">
    <div class="server-info">
      <h1 @click="handleServerInfo">
        {{ apx.data.currentServer.name }}
      </h1>
      <button @click="serverInfoMenuOpen = !serverInfoMenuOpen">
        <ArrowIcon style="transition: all 150ms" :style="serverInfoMenuOpen ? '' : 'transform: rotate(-90deg)'" />
      </button>
    </div>
    <div class="server-info-menu" v-if="serverInfoMenuOpen">
      <Button>
        <span>Server settings</span>
        <SettingsIcon style="transform: rotate(-90deg)" />
      </Button>
      <Button @click="handleEditChannels" :color="apx.layout.channelEditMode ? 'secondary' : 'default'">
        <span>Edit channels</span>
        <EditIcon style="transform: rotate(-90deg)" />
      </Button><Button @click="handleCreateChannel">
        <span>Create channel</span>
        <PlusIcon />
      </Button>
    </div>
  </header>

  <!-- Would put more effort into this, but don't have anywhere to test it - oxy -->
  <div class="server-banner" v-if="apx.data.currentServer && isBannerImage">
    <img v-if="apx.data.currentServer.banner"
      :src="`https://cdn.discordapp.com/banners/${apx.data.currentServer.id}/${apx.data.currentServer.banner}.webp?size=256`" />
    <img v-else-if="apx.data.currentServer.splash"
      :src="`https://cdn.discordapp.com/splashes/${apx.data.currentServer.id}/${apx.data.currentServer.splash}.jpg?size=256`" />
  </div>
</template>

<script>
import ArrowIcon from "../icons/ArrowIcon.vue";
import EditIcon from "../icons/EditIcon.vue";
import SettingsIcon from "../icons/SettingsIcon.vue";
import PlusIcon from "../icons/PlusIcon.vue";
import Button from "../base/Button.vue";
import { useAppStore } from "../../stores/app";

export default {
  components: { ArrowIcon, EditIcon, SettingsIcon, PlusIcon, Button },
  data() {
    return {
      apx: useAppStore(),
      serverInfoMenuOpen: false,
    };
  },
  methods: {
    handleServerInfo() {
      this.$router.push(`/server/${this.apx.data.currentServerId}`);
    },
    handleEditChannels() {
      this.apx.layout.channelEditMode = !this.apx.layout.channelEditMode;
      if (!this.apx.layout.channelEditMode) {
        this.serverInfoMenuOpen = false;
      }
    },
    handleCreateChannel() {
      this.apx.layout.channelEditMode = true;
      this.serverInfoMenuOpen = false;
      this.$router.push(`/server/${this.apx.data.currentServerId}/edit/0`);
    },
  },
  computed: {
    isBannerImage() {
      return this.apx.data.currentServer.banner || this.apx.data.currentServer.splash
    }
  },
}
</script>
