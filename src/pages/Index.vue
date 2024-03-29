<style lang="scss" scoped>
#page_wrapper {
  position: relative;
  display: grid;
  place-items: center;
  text-align: center;
  height: 100%;

  .loading {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    background-color: rgba($color: #000000, $alpha: 0.5);
    border-radius: var(--radius-md);
    font-size: 4rem;
    user-select: none;
    z-index: 537;

    & > * {
      color: white;
    }
  }

  h1 {
    color: var(--text-highlight-color);
    transition: all 1s;
    margin-bottom: 0;
    font-size: clamp(12px, 5vw, 64px);
    rotate: 0deg;

    span {
      color: var(--primary-color);
    }
  }
  h3 {
    margin-top: 0;
    font-size: clamp(8px, 1.6vw, 48px);
    font-weight: 500;
  }

  .login-wrapper {
    display: flex;
    flex-flow: column nowrap;
    gap: var(--gap-md);
    .input-wrapper {
      display: flex;
      flex-flow: row nowrap;
      background-color: var(--button-color);
      border-radius: var(--radius-sm);
      font-size: 1.2rem;
      overflow: hidden;

      &:focus-within {
        outline: 2px solid var(--primary-color);
      }

      input,
      button {
        color: var(--text-color);
        background-color: var(--button-color);
        border-radius: 0;
        border: none;
        font-size: inherit;
        padding: 0.3rem 0.73rem;
        outline: none;

        &:focus-visible {
          filter: brightness(150%);
        }
      }

      input {
        width: 100%;
      }

      button {
        display: grid;
        place-items: center;
        cursor: pointer;
      }
    }
    .remember-token {
      .checkbox {
        display: flex;
        flex-flow: row nowrap;
        justify-content: center;
      }
      .remember-warning {
        color: #a34602;
        margin: 0;
      }
    }
    .login-button {
      width: fit-content;
      margin-inline: auto;
      color: black;
      background-color: var(--primary-color);
      border-radius: var(--radius-sm);
      border: none;
      font-weight: 700;
      padding: 0.63rem 1.2rem;
      cursor: pointer;
    }
  }

  .welcome-wrapper {
    h1 span,
    h4 span {
      color: var(--primary-color);
    }
    h1,
    h4 {
      margin: 0;
    }
  }
}
</style>

<template>
  <div id="page_wrapper">
    <div class="login-form" v-if="!apx.isLoggedIn">
      <div class="loading" v-if="apx.logging">
        <LoadingIcon :animated="true" />
      </div>
      <h1 @click.prevent="headingEasterEgg">D<span>i</span>gg<span>i</span>e</h1>
      <h3>a simple Discord client for bots</h3>
      <div class="login-wrapper">
        <div class="input-wrapper">
          <input ref="TokenInput" :type="tokenVisible ? 'text' : 'password'" placeholder="Put your bot token here..." />
          <button @click="tokenVisible = !tokenVisible">
            <EyeVisibleIcon v-if="!tokenVisible" />
            <EyeHiddenIcon v-else />
          </button>
        </div>
        <div class="remember-token">
          <div class="checkbox">
            <input type="checkbox" id="rememberToken" name="rememberToken" v-model="rememberToken" />
            <label for="rememberToken">Remember token</label><br />
          </div>
          <p v-if="rememberToken" class="remember-warning">
            [WARNING] This will save the token <br />
            to your local hardrive (insecure)
          </p>
        </div>
        <button @click="login" class="login-button" :disabled="apx.logging">Login</button>
      </div>
    </div>
    <div class="welcome-wrapper" v-else>
      <h1>
        Welcome <span>{{ apx.user.username ? apx.user.username : "" }}</span>
      </h1>
      <h4>to D<span>i</span>gg<span>i</span>e</h4>
      <!-- <p>{{ apx.user }}</p> -->
    </div>
  </div>
</template>

<script>
import { useAppStore } from "../stores/app";
import { login } from "../core/discord/api";
import LoadingIcon from "../components/icons/LoadingIcon.vue";
import EyeVisibleIcon from "../components/icons/EyeVisibleIcon.vue";
import EyeHiddenIcon from "../components/icons/EyeHiddenIcon.vue";

export default {
  components: { LoadingIcon, EyeVisibleIcon, EyeHiddenIcon },
  data() {
    return {
      tokenVisible: false,
      rememberToken: false,
      apx: useAppStore(),
      lastHeadingClick: null,
    };
  },
  mounted() {
    this.apx.layout.showChannels = this.apx.isLoggedIn;
    this.apx.layout.showServers = this.apx.isLoggedIn;
  },
  methods: {
    login() {
      const tokenInputEl = this.$refs.TokenInput;
      let token = null;
      if (tokenInputEl) {
        token = tokenInputEl.value;
      }
      login(token, this.rememberToken);
    },
    headingEasterEgg(ev) {
      if (this.lastHeadingClick && new Date().getTime() - this.lastHeadingClick < 300) {
        console.log(ev);
        ev.target.style.rotate = ev.target.style.rotate === "360deg" ? "0deg" : "360deg";
      }
      this.lastHeadingClick = new Date().getTime();
    },
  },
  computed: {
    currentUser() {
      return useAppStore().user;
    },
  },
};
</script>
