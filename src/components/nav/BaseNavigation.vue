<style lang="scss" scoped>
.nav-wrapper {
  --_fullNavWidth: 0px;
  --_leftNavWidth: 48px;
  --_rightNavWidth: calc(var(--_fullNavWidth) - var(--_leftNavWidth) - var(--_serversChannelsGap) - 2 * var(--gap-md));
  --_itemSize: 38px;
  --_userInfoHeight: 65px;
  --_serversChannelsGap: 0;

  &.nav-servers-open {
    --_fullNavWidth: var(--_leftNavWidth);
  }

  &.nav-channels-open {
    --_fullNavWidth: 210px;
    --_serversChannelsGap: var(--gap-md);

    &.nav-servers-open {
      --_fullNavWidth: 270px !important;
    }
  }

  height: 100%;
  width: var(--_fullNavWidth);
  display: flex;
  flex-flow: row nowrap;
  gap: var(--_serversChannelsGap);
}

.guild-navigation {
  height: 100%;
  width: var(--_leftNavWidth);
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  gap: var(--gap-md);

  .important-navigation,
  .layout-navigation {
    display: flex;
    flex-flow: column nowrap;
    justify-content: stretch;
    align-items: center;
    gap: var(--gap-md);
    width: var(--_leftNavWidth);
    min-height: var(--_leftNavWidth);
    background-color: var(--foreground-color);
    border-radius: var(--radius-md);
    padding: var(--gap-sm);

    button {
      padding: 0 !important;
      width: var(--_itemSize);
      height: var(--_itemSize);
      font-size: 1.6rem;
    }
  }
}

.channel-navigation-wrapper {
  width: var(--_fullNavWidth);
  height: 100%;
  overflow-y: hidden;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: var(--gap-md);

  .channel-navigation {
    flex-grow: 1;
    flex-shrink: 1;
    width: 100%;
    background-color: var(--foreground-color);
    border-radius: var(--radius-md);
    padding: var(--gap-md);
  }

  .guild-header-wrapper,
  .user-info-wrapper {
    flex-grow: 2;
    flex-shrink: 0;
    width: 100%;
    background-color: var(--foreground-color);
    border-radius: var(--radius-md);
    padding: var(--gap-sm);
  }

  .guild-header-wrapper {
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
    min-height: var(--_leftNavWidth);
  }
}
</style>

<template>
  <div class="nav-wrapper" ref="navWrapper" id="MainNavWrapper" :class="{
    'nav-servers-open': apx.layout.showServers,
    'nav-channels-open': apx.layout.showChannels,
  }">
    <div class="guild-navigation" v-if="apx.layout.showServers">
      <div class="important-navigation">
        <Button @click="onHomeClicked" :color="apx.data.currentServerId === 'dms' ? 'primary' : 'default'">
          <HomeIcon />
        </Button>
      </div>
      <ServerNavigation />
      <div class="layout-navigation">
        <Button @click="apx.layout.showChannels = !apx.layout.showChannels">
          <ShowLayoutIcon :show="apx.layout.showChannels" />
        </Button>
      </div>
    </div>
    <div class="channel-navigation-wrapper" v-if="apx.layout.showChannels">
      <div class="guild-header-wrapper">
        <GuildHeader v-if="!apx.layout.isInDirrectMessages" />
      </div>
      <div class="channel-navigation">
        <ChannelNavigation v-if="!apx.layout.isInDirrectMessages" :key="apx.data.channels.length" />
        <DirectMessagesNavigation v-else />
      </div>
      <div class="user-info-wrapper">
        <UserInfo :key="apx.user" />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { useAppStore } from "../../stores/app";
import ServerNavigation from "./ServerNavigation.vue";
import ChannelNavigation from "./ChannelNavigation.vue";
import DirectMessagesNavigation from "./DirectMessagesNavigation.vue";
import Button from "../base/Button.vue";
import HomeIcon from "../icons/HomeIcon.vue";
import UserInfo from "./UserInfo.vue";
import GuildHeader from "../guild/GuildHeader.vue";
import ShowLayoutIcon from "../icons/ShowLayoutIcon.vue";
import { getDms } from "../../core/discord/channels";

export default defineComponent({
  name: "BaseNavigation",
  components: {
    UserInfo,
    ServerNavigation,
    ChannelNavigation,
    DirectMessagesNavigation,
    HomeIcon,
    ShowLayoutIcon,
    Button,
    GuildHeader,
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
