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
    margin-bottom: 0;
    font-size: clamp(8px, 1.6vw, 48px);
    font-weight: 500;
  }

  .login-form {
    button {
      display: inline-flex;
      width: fit-content;
      align-items: center;
      gap: var(--gap-sm);
      color: black;
      background-color: var(--primary-color);
      border-radius: var(--radius-sm);
      transition: all 150ms;
      margin-inline: auto;
      border: none;
      font-weight: 700;
      padding: 0.63rem 1.2rem;
      cursor: pointer;

      &:hover {
        color: var(--text-highlight-color);
        background-color: var(--primary-muted-color);
      }
    }
  }

  .login-wrapper {
    display: flex;
    flex-flow: column nowrap;
    gap: var(--gap-md);
    margin-top: var(--gap-md);

    .saved-logins-reminder span {
      color: var(--primary-color);
      cursor: pointer;
    }

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
        color: #e67e34;
        font-weight: 600;
        margin: 0;
      }
    }
  }
  .saved-logins-wrapper {
    display: grid;
    grid-template-rows: 25px auto 35px;
    gap: var(--gap-md);

    padding: var(--gap-md);

    .list-of-logins {
      display: flex;
      flex-flow: column nowrap;
      gap: var(--gap-sm);
      max-height: 400px;
      overflow-y: auto;

      .saved-login {
        display: grid;
        grid-template-columns: 50px auto 50px;
        align-items: center;
        gap: var(--gap-md);
        transition: all 150ms;
        background-color: var(--button-color);
        border-radius: var(--radius-md);
        padding: var(--gap-sm);

        img {
          border-radius: var(--radius-md);
        }

        .saved-login-info {
          display: flex;
          flex-flow: column nowrap;
          align-items: flex-start;

          strong {
            color: var(--text-highlight-color);
          }
          span {
            font-size: 0.8rem;
          }
        }
        .login-button {
          padding: var(--gap-md);
        }
      }
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
      <h1 @click.prevent="headingEasterEgg">
        D<span>i</span>gg<span>i</span>e
      </h1>
      <h3>a simple Discord client for bots</h3>
      <div
        class="saved-logins-wrapper"
        v-if="apx.data.savedAuthorizations != [] && !ignoreSavedLogins"
      >
        <p>Your saved logins:</p>
        <div class="list-of-logins">
          <div
            class="saved-login"
            v-for="login in apx.data.savedAuthorizations"
          >
            <img
              :src="`https://cdn.discordapp.com/avatars/${login.account.id}/${login.account.avatar}.webp?size=48`"
            />
            <div class="saved-login-info">
              <strong>{{ login.account.username }}</strong>
              <span
                >last login:
                {{
                  new Date(
                    login.last_touched.secs_since_epoch * 1000
                  ).toLocaleDateString()
                }}</span
              >
            </div>
            <button class="login-button" @click="savedLogin(login)">
              <ArrowIcon style="transform: rotate(-90deg)" />
            </button>
          </div>
        </div>
        <button @click="ignoreSavedLogins = !ignoreSavedLogins">
          Manual login <ArrowIcon style="transform: rotate(-90deg)" />
        </button>
      </div>
      <div class="login-wrapper" v-else>
        <p
          class="saved-logins-reminder"
          v-if="apx.data.savedAuthorizations != []"
        >
          To access your saved accounts, simply go
          <span @click="ignoreSavedLogins = !ignoreSavedLogins">here</span>.
        </p>
        <div class="input-wrapper">
          <input
            ref="TokenInput"
            :type="tokenVisible ? 'text' : 'password'"
            placeholder="Put your bot token here..."
          />
          <button @click="tokenVisible = !tokenVisible">
            <EyeVisibleIcon v-if="!tokenVisible" />
            <EyeHiddenIcon v-else />
          </button>
        </div>
        <div class="remember-token">
          <div class="checkbox">
            <input
              type="checkbox"
              id="rememberToken"
              name="rememberToken"
              v-model="rememberToken"
            />
            <label for="rememberToken">Remember token</label><br />
          </div>
          <p v-if="rememberToken" class="remember-warning">
            [WARNING] This will save the token <br />
            to your local hardrive with weak encryption
          </p>
        </div>
        <button @click="login" class="login-button" :disabled="apx.logging">
          Login
        </button>
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
import ArrowIcon from "../components/icons/ArrowIcon.vue";

export default {
  components: { ArrowIcon, LoadingIcon, EyeVisibleIcon, EyeHiddenIcon },
  data() {
    return {
      tokenVisible: false,
      rememberToken: false,
      apx: useAppStore(),
      lastHeadingClick: null,
      ignoreSavedLogins: false,
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
    savedLogin(s_login) {
      login(s_login.token.replace("Bot ", ""), false);
    },
    headingEasterEgg(ev) {
      if (
        this.lastHeadingClick &&
        new Date().getTime() - this.lastHeadingClick < 300
      ) {
        console.log(ev);
        ev.target.style.rotate =
          ev.target.style.rotate === "360deg" ? "0deg" : "360deg";
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
