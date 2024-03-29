<style lang="scss" scoped>
.user-info {
  min-height: 40px;

  .base {
    display: flex;
    flex-flow: row nowrap;
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
  }
}
</style>

<template>
  <div class="user-info">
    <div class="settings" v-if="settingsOpen">
      <hr />
    </div>
    <div class="base" v-if="apx.isLoggedIn">
      <div class="user">
        <div class="profile-picture-holder">
          <img :src="`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=40`" alt="" />
        </div>
        <div class="user-name">
          <strong>{{ user.global_name || user.username }} <span class="bot-tag" v-if="user.bot">BOT</span></strong>
          <em>#{{ user.discriminator }}</em>
        </div>
      </div>
      <div class="buttons"></div>
    </div>
  </div>
</template>
<script>
import { useAppStore } from "../../stores/app";
export default {
  data() {
    return {
      apx: useAppStore(),
      user: useAppStore().user,
      settingsOpen: false,
    };
  },
};
</script>
