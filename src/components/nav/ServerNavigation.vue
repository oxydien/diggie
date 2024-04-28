<style lang="scss" scoped>
.server-nav {
  position: relative;
  height: 100%;
  width: 60px;
  display: flex;
  flex-flow: column nowrap;
  background-color: var(--foreground-color);
  border-radius: var(--radius-md);
  padding: var(--gap-sm);
  scrollbar-width: 0;
  overflow-y: clip;

  &::-webkit-scrollbar {
    display: none;
  }
}

.server {
  --_serverSize: 48px;
  position: relative;
  height: var(--_serverSize);
  aspect-ratio: 1/1;
  transition: all 120ms;
  background-color: var(--button-color-muted);
  border-radius: var(--radius-lg);

  cursor: pointer;

  &::after {
    content: attr(data-guild-name);
    position: absolute;
    top: 50%;
    left: calc(var(--_serverSize) + var(--gap-sm));
    width: max-content;
    transition: all 120ms;
    transform-origin: left;
    background-color: var(--button-color);
    border-radius: var(--radius-sm);
    padding: var(--gap-sm);
    font-weight: 600;
    transform: translateY(-50%) scale(0);
    box-shadow: 2px 2px 5px 0 black;
    opacity: 0;
    z-index: 640;
  }

  &:hover {
    background-color: var(--button-color);

    &::after {
      opacity: 1;
      transform: translateY(-50%) scale(1);
    }
  }

  &.active {
    outline: 2px solid var(--primary-muted-color);
  }

  img {
    height: var(--_serverSize);
    aspect-ratio: 1/1;
    border-radius: 50%;
  }
}

.loading-default {
  font-size: 1.3rem;
}
</style>

<template>
  <div class="server-nav">
    <div class="loading-default" v-if="apx.buffer.loadingGuilds">
      <LoadingIcon :animated="true" />
    </div>
    <div
      class="server"
      :id="guild.id"
      :class="{ active: apx.data.currentServerId === guild.id }"
      v-bind:data-guild-name="guild.name"
      @click="loadChannels(guild.id)"
      v-for="guild in apx.data.guilds"
    >
      <img :src="`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=64`" />
    </div>
  </div>
</template>

<script>
import { getChannels } from "../../core/discord/channels";
import { getGuildInfo } from "../../core/discord/guilds";
import { getGuildMembers } from "../../core/discord/members";
import { useAppStore } from "../../stores/app";
import LoadingIcon from "../icons/LoadingIcon.vue";

export default {
	components: { LoadingIcon },
	data() {
		return {
			apx: useAppStore(),
		};
	},
	methods: {
		loadChannels(id) {
			if (this.apx.buffer.loadingChannels) return;
			this.apx.data.currentServer = this.apx.data.channels.find(
				(el) => el.id === id,
			);
			this.apx.data.currentServerId = id;
			this.$router.push(`/server/${id}`);
			getChannels(id);
			getGuildInfo(id);
			getGuildMembers(id);
		},
	},
};
</script>
