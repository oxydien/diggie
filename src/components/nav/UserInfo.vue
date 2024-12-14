<style lang="scss" scoped>
.user-info {
  min-height: 40px;

  .base {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    gap: var(--gap-sm);

    .user {
      display: flex;
      flex-flow: row nowrap;
      gap: var(--gap-sm);
      align-items: center;

      .profile-picture-holder {
        display: grid;
        place-items: center;

        img {
          height: 38px;
          width: 38px;
        }
      }

      .user-name {
        display: flex;
        flex-flow: column nowrap;

        em {
          font-size: 0.7rem;
          font-style: normal;
        }

        span.bot-tag {
          color: black;
          background-color: var(--primary-color);
          font-size: 0.7rem;
          padding: 0 2px;
          border-radius: 4px;
        }
      }
    }

    .settings-button {
      width: fit-content;
      padding: var(--gap-sm);
      border-radius: var(--radius-md);
    }
  }

  .settings {
    display: flex;
    flex-flow: column nowrap;
    gap: var(--gap-md);

    h3 {
      margin: 0;
      text-align: center;
    }

    .buttons {
      display: flex;
      flex-flow: column nowrap;
      gap: var(--gap-sm);

      button {
        justify-content: space-between;
        padding: var(--gap-sm);
      }
    }
    .hr {
      height: 3px;
      border-radius: 5px;
      background-color: var(--text-color);
      margin: var(--gap-sm) 0;
    }
  }
}
</style>

<template>
  <div class="user-info">
    <div class="settings" v-if="settingsOpen">
      <h3>Fast Settings</h3>
      <div class="buttons">
        <Button>
          <span>Settings</span>
          <SettingsIcon />
        </Button>
        <Button @click="copyCurrentUserId">
          <span>Copy User ID</span>
          <IdIcon />
        </Button>
        <Button @click="logout">
          <span>Log out</span>
          <ArrowIcon style="transform: rotate(-90deg)" />
        </Button>
      </div>
      <div class="hr"></div>
    </div>
    <div class="base" v-if="apx.isLoggedIn">
      <div class="user">
        <div class="profile-picture-holder">
          <Avatar
            :src="user.id && user.avatar ?`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=40` : null"
          />
        </div>
        <div class="user-name">
          <strong
            >{{ user.global_name || user.username }}
            <span class="bot-tag" v-if="user.bot">BOT</span></strong
          >
          <em>#{{ user.discriminator }}</em>
        </div>
      </div>
      <Button class="settings-button" @click="toggleUserSettings">
        <SettingsIcon />
      </Button>
    </div>
  </div>
</template>
<script>
import { logout } from "../../core/discord/auth";
import { useAppStore } from "../../stores/app";
import ArrowIcon from "../icons/ArrowIcon.vue";
import IdIcon from "../icons/IdIcon.vue";
import SettingsIcon from "../icons/SettingsIcon.vue";
import Button from "../base/Button.vue";
import Avatar from "../base/Avatar.vue";

export default {
	components: { ArrowIcon, IdIcon, SettingsIcon, Button, Avatar },
	data() {
		return {
			apx: useAppStore(),
			user: useAppStore().user,
			settingsOpen: false,
		};
	},
	methods: {
		toggleUserSettings() {
			this.settingsOpen = !this.settingsOpen;
		},
		copyCurrentUserId() {
			this.settingsOpen = false;
			navigator.clipboard.writeText(this.user.id);
		},
		async logout() {
			this.settingsOpen = false;
			await logout();
			this.$router.push("/");
		},
	},
};
</script>
