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
      display: grid;
      place-items: center;
      border: none;
      height: fit-content;
      width: fit-content;
      color: var(--text-color);
      background-color: var(--button-color);
      border-radius: var(--radius-md);
      padding: var(--gap-sm);
      cursor: pointer;

      &:hover {
        background-color: var(--button-color-muted);
      }
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
      <h3>Settings</h3>
      <div class="buttons">
        <button @click="logout">
          <span>Log out</span>
          <ArrowIcon style="transform: rotate(-90deg)" />
        </button>
        <button @click="copyCurrentUserId">
          <span>Copy User ID</span>
          <ArrowIcon style="transform: rotate(-90deg)" />
        </button>
      </div>
      <div class="hr"></div>
    </div>
    <div class="base" v-if="apx.isLoggedIn">
      <div class="user">
        <div class="profile-picture-holder">
          <img
            :src="`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=40`"
            alt=""
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
      <button class="settings-button" @click="toggleUserSettings">
        <SettingsIcon />
      </button>
    </div>
  </div>
</template>
<script>
import { logout } from "../../core/discord/api";
import { useAppStore } from "../../stores/app";
import ArrowIcon from "../icons/ArrowIcon.vue";
import SettingsIcon from "../icons/SettingsIcon.vue";

export default {
  components: { ArrowIcon, SettingsIcon },
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
