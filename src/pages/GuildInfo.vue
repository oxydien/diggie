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

  section {
    display: flex;
    flex-flow: column nowrap;
    gap: var(--gap-sm);
    font-size: clamp(0.8rem, 1.8vw, 1.4rem);
    padding: var(--gap-md);
    border-radius: var(--radius-md);
    background-color: var(--background-color);
    max-width: 700px;
    margin: var(--gap-md) auto;

    h4 {
      margin: 0 0 var(--gap-sm) 0;
    }

    .custom-emoji-wrapper {
      display: grid;
      grid-template-columns: 2em 1fr 20ch;
      align-items: center;
      gap: var(--gap-md);
      padding: var(--gap-sm);
      border-radius: var(--radius-md);
      background-color: var(--foreground-color);

      em {
        text-align: start;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Emoji itself */
      &> :first-child {
        font-size: 2em;
      }
    }

    .custom-sticker-wrapper {
      display: grid;
      grid-template: "sticker name id" "sticker description description";
      align-items: center;
      gap: var(--gap-md);
      padding: var(--gap-sm);
      border-radius: var(--radius-md);
      background-color: var(--foreground-color);

      em {
        grid-area: name;
      }

      span {
        grid-area: id;
      }

      p {
        grid-area: description;
      }

      em,
      p {
        text-align: start;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Sticker itself */
      &> :first-child {
        grid-area: sticker;
        font-size: 0.6em;
      }
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
        <img v-if="apx.data.currentServer"
          :src="`https://cdn.discordapp.com/icons/${apx.data.currentServer.id}/${apx.data.currentServer.icon}.webp?size=40`" />
        <h2>{{ apx.data.currentServer ? apx.data.currentServer.name : "" }}</h2>
      </div>
      <button @click="apx.layout.showMembers = !apx.layout.showMembers">
        <ShowLayoutIcon :show="apx.layout.showMembers" />
      </button>
    </div>
    <div class="content">
      <section class="roles"
        v-if="apx.data.currentServer && apx.data.currentServer.roles && apx.data.currentServer.roles.length > 0">
        <h4>Server roles</h4>
        <RoleView v-for="role in apx.data.currentServer.roles" :role="role" />
      </section>
      <section class="emojis"
        v-if="apx.data.currentServer && apx.data.currentServer.emojis && apx.data.currentServer.emojis.length > 0">
        <h4>Server emojis</h4>
        <div class="custom-emoji-wrapper" v-for="emoji in apx.data.currentServer.emojis">
          <CustomEmoji :emoji="emoji" />
          <em>{{ emoji.name }}</em>
          <span>{{ emoji.id }}</span>
        </div>
      </section>
      <section class="stickers"
        v-if="apx.data.currentServer && apx.data.currentServer.stickers && apx.data.currentServer.stickers.length > 0">
        <h4>Server stickers</h4>
        <div class="custom-sticker-wrapper" v-for="sticker in apx.data.currentServer.stickers">
          <Sticker :sticker="sticker" />
          <em>{{ sticker.name }}</em>
          <span>{{ sticker.id }}</span>
          <p>{{ sticker.description }}</p>
        </div>
      </section>
      <section class="features"
        v-if="apx.data.currentServer && apx.data.currentServer.features && apx.data.currentServer.features.length > 0">
        <h4>Server "features"</h4>
        <span v-for="feature in apx.data.currentServer.features">{{ feature }}</span>
      </section>
      <!--{{ apx.data.currentServer }} -->
    </div>
  </div>
</template>

<script>
import { useAppStore } from "../stores/app";
import LoadingIcon from "../components/icons/LoadingIcon.vue";
import ShowLayoutIcon from "../components/icons/ShowLayoutIcon.vue";
import RoleView from "../components/user/role/RoleView.vue";
import CustomEmoji from "../components/message/CustomEmoji.vue";
import Sticker from "../components/message/Sticker.vue";

export default {
  components: { LoadingIcon, ShowLayoutIcon, RoleView, CustomEmoji, Sticker },
  data() {
    return {
      apx: useAppStore(),
    };
  },
};
</script>
