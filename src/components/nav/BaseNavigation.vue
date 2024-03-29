<style lang="scss" scoped>
@mixin disableDefaultButton {
  border: none;
  color: var(--text-color);
  background-color: var(--button-color);
  border-radius: var(--radius-md);
  cursor: pointer;
}

.nav-wrapper {
  --_fullNavWidth: 0px;
  --_leftNavWidth: 60px;
  --_userInfoHeight: 65px;

  &.nav-servers-open {
    --_fullNavWidth: 60px;
  }

  &.nav-channels-open {
    --_fullNavWidth: 210px;

    &.nav-servers-open {
      --_fullNavWidth: 270px !important;
    }
  }

  height: 100%;
  width: var(--_fullNavWidth);
  display: flex;
  flex-flow: row nowrap;
  gap: var(--gap-md);
}

.guild-navigation {
  height: 100%;
  width: var(--_leftNavWidth);
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  gap: var(--gap-md);

  .button-navigation {
    display: flex;
    flex-flow: column nowrap;
    justify-content: stretch;
    align-items: stretch;
    gap: var(--gap-md);
    width: var(--_leftNavWidth);
    background-color: var(--foreground-color);
    border-radius: var(--radius-md);
    padding: var(--gap-sm);

    button {
      @include disableDefaultButton;
      display: grid;
      place-items: center;
      position: relative;
      width: 100%;
      aspect-ratio: 1/1;
      transition: all 120ms;
      background-color: var(--button-color-muted);
      padding: 0;
      font-size: 1.6rem;

      &:hover {
        background-color: var(--button-color);
      }

      &.active {
        background-color: var(--primary-muted-color);
      }
    }
  }
}

.channel-navigation-wrapper {
  width: var(--_fullNavWidth);
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  gap: var(--gap-md);

  .channel-navigation {
    flex-grow: 1;
    flex-shrink: 1;
    width: 100%;
    height: calc(100% - var(--_userInfoHeight));
    background-color: var(--foreground-color);
    border-radius: var(--radius-md);
    padding: var(--gap-sm);
  }

  .user-info-wrapper {
    flex-grow: 2;
    flex-shrink: 0;
    width: 100%;
    background-color: var(--foreground-color);
    border-radius: var(--radius-md);
    padding: var(--gap-sm);
  }
}
</style>

<template>
  <div
    class="nav-wrapper"
    ref="navWrapper"
    :class="{
      'nav-servers-open': apx.layout.showServers,
      'nav-channels-open': apx.layout.showChannels,
    }"
  >
    <div class="guild-navigation" v-if="apx.layout.showServers">
      <div class="button-navigation">
        <button @click="onHomeClicked" :class="{ active: apx.data.currentServerId === 'dms' }">
          <HomeIcon />
        </button>
        <button @click="apx.layout.showChannels = !apx.layout.showChannels">
          <ShowLayoutIcon :show="apx.layout.showChannels" />
        </button>
      </div>
      <ServerNavigation />
    </div>
    <div class="channel-navigation-wrapper" v-if="apx.layout.showChannels">
      <div class="channel-navigation">
        <ServerChannelNavigation v-if="!apx.layout.isInDirrectMessages" :key="apx.data.channels.length" />
        <DirectMessagesNavigation v-else />
      </div>
      <div class="user-info-wrapper">
        <UserInfo :key="apx.user" />
      </div>
    </div>
  </div>
</template>

<script>
import { useAppStore } from "../../stores/app";
import UserInfo from "./UserInfo.vue";
import ServerNavigation from "./ServerNavigation.vue";
import ServerChannelNavigation from "./ServerChannelNavigation.vue";
import DirectMessagesNavigation from "./DirectMessagesNavigation.vue";
import { defineComponent } from "vue";
import HomeIcon from "../icons/HomeIcon.vue";
import ShowLayoutIcon from "../icons/ShowLayoutIcon.vue";
import { getDms } from "../../core/discord/api";

export default defineComponent({
  name: "BaseNavigation",
  components: {
    UserInfo,
    ServerNavigation,
    ServerChannelNavigation,
    DirectMessagesNavigation,
    HomeIcon,
    ShowLayoutIcon,
  },
  data() {
    return {
      apx: useAppStore(),
    };
  },
  methods: {
    onHomeClicked() {
      getDms();
      this.$router.push("/");
    },
  },
});
</script>
