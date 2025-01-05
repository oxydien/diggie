<style lang="scss" scoped>
.login-form {
  --_form-width: min(calc(var(--app-width) - (var(--gap-md) * 2)), 400px);

  min-width: var(--_form-width);
  width: var(--_form-width);
  max-width: var(--_form-width);
  padding: var(--gap-md);
  background-color: var(--background-color);
  border-radius: var(--radius-md);
}

.login-wrapper {
  display: flex;
  flex-flow: column nowrap;
  text-align: initial;

  label {
    margin: var(--gap-md) auto var(--gap-sm) var(--gap-sm);

    &::after {
      content: ':';
    }
  }

  .token-visibility-toggle {
    max-width: fit-content;
    padding: var(--gap-sm);
  }

  .remember-token {
    display: grid;
    margin-block: var(--gap-md);

    .remember-warning {
      color: var(--text-muted-color);
      font-size: 0.8rem;
      text-align: justify;
      margin-bottom: var(--gap-md);

      &.active {
        color: var(--warn-color);
      }
    }
  }
}

.saved-logins-wrapper {
  display: grid;
  grid-template-rows: 25px auto;
  gap: var(--gap-md);
  text-align: initial;

  padding: var(--gap-md);

  &>p {
    margin: var(--gap-md) auto var(--gap-sm) var(--gap-sm);
  }

  .list-of-logins {
    display: flex;
    flex-flow: column nowrap;
    gap: var(--gap-sm);
    max-height: 400px;
    overflow-y: auto;

    &:empty {
      position: relative;
      padding: var(--gap-lg);
      border-radius: var(--radius-md);
      border: 2px dashed var(--text-muted-color);

      &::after {
        content: 'No saved logins';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }

    .saved-login {
      display: grid;
      grid-template-columns: 50px auto 30px 40px;
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

      .remove-button {
        padding: var(--gap-sm);
      }

      .login-button {
        width: fit-content;
        padding: var(--gap-md);
      }
    }
  }
}

.carousel-item {
  /* For shadows and outlines */
  padding: 2px;
}
</style>

<template>
  <div class="login-form">
    <ChipSingle :options="['New login', 'Saved logins']" @change="handleChipChange" ref="chip" />

    <Carousel ref="carousel">
      <!-- Saved logins -->
      <div class="saved-logins-wrapper carousel-item">
        <p>Log into your saved bots:</p>
        <div class="list-of-logins">
          <div class="saved-login" v-for="(login, index) in apx.data.savedAuthorizations">
            <img :src="`https://cdn.discordapp.com/avatars/${login.account.id}/${login.account.avatar}.webp?size=48`" />
            <div class="saved-login-info">
              <strong>{{ login.account.username }}</strong>
              <span>last login:
                {{
                  new Date(
                    login.last_touched.secs_since_epoch * 1000
                  ).toLocaleDateString()
                }}</span>
            </div>
            <Button class="remove-button" :loading="apx.logging" color="destructive" @dblclick="removeSavedLogin(index)">
              <DeleteIcon />
            </Button>
            <Button class="login-button" :loading="apx.logging" color="primary" @click="handleSavedLogin(login)">
              <ArrowIcon style="transform: rotate(-90deg)" />
            </Button>
          </div>
        </div>
      </div>

      <!-- Manual login -->
      <div class="login-wrapper carousel-item">
        <label for="token">Your bot token</label>
        <div class="input-wrapper">
          <IconifiedInput v-model="inputs.token" :rightIcon="true" :type="tokenVisible ? 'text' : 'password'"
            placeholder="Put your bot token here...">
            <Button class="token-visibility-toggle" @click="tokenVisible = !tokenVisible">
              <EyeVisibleIcon v-if="!tokenVisible" />
              <EyeHiddenIcon v-else />
            </Button>
          </IconifiedInput>
        </div>
        <div class="remember-token">
          <Checkbox v-model="inputs.rememberToken">Remember token</Checkbox>
          <p class="remember-warning" :class="{ 'active': inputs.rememberToken }">
            This will save the token to your local hardrive with weak encryption algorithm. <a target="_top"
              href="https://github.com/oxydien/diggie/blob/main/INFO.md#saving-tokens">[learn more]</a>
          </p>
        </div>
        <Button @click="handleLogin" color="primary" class="login-button" :loading="apx.logging">
          Login
        </Button>
      </div>

      <!-- Default page, should never be seen -->
      <div class="default-page carousel-item">
        <p>How did you get here?</p>
        <Button @click="goToPage('saved')">Saved logins</Button>
        <Button @click="goToPage('login')">Manual login</Button>
      </div>
    </Carousel>
  </div>
</template>

<script>
import { invoke } from "@tauri-apps/api/core";
import EyeHiddenIcon from "../icons/EyeHiddenIcon.vue";
import EyeVisibleIcon from "../icons/EyeVisibleIcon.vue";
import Button from "../base/Button.vue";
import Checkbox from "../base/Checkbox.vue";
import IconifiedInput from "../base/IconifiedInput.vue";
import { useAppStore } from "../../stores/app";
import ArrowIcon from "../icons/ArrowIcon.vue";
import DeleteIcon from "../icons/DeleteIcon.vue";
import ChipSingle from "../base/ChipSingle.vue";
import Carousel from "../base/Carousel.vue";

export default {
  components: {
    EyeVisibleIcon,
    EyeHiddenIcon,
    ArrowIcon,
    DeleteIcon,
    Button,
    Checkbox,
    ChipSingle,
    Carousel,
    IconifiedInput,
  },
  data() {
    return {
      apx: useAppStore(),
      tokenVisible: false,
      currentSubPage: "login",
      inputs: {
        token: "",
        rememberToken: false,
      },
    };
  },
  watch: {
    "apx.data.savedAuthorizations": {
      handler() {
        if (this.apx.data.savedAuthorizations.length > 0) {
          this.goToPage("saved");
          this.$refs.chip.setIndex(1);
        } else {
          this.goToPage("login");
          this.$refs.chip.setIndex(0);
        }
      },
      deep: true,
    }
  },
  emits: ["login"],
  mounted() {
    this.$nextTick(() => {
      if (this.apx.data.savedAuthorizations.length > 0) {
        this.goToPage("saved");
        this.$refs.chip.setIndex(1);
      } else {
        this.goToPage("login");
        this.$refs.chip.setIndex(0);
      }
    })
  },
  methods: {
    handleLogin() {
      if (this.apx.logging) return;
      this.$emit("login", this.inputs);
    },
    handleSavedLogin(login) {
      if (this.apx.logging) return;
      this.inputs.token = login.token.replace("Bot ", "");
      this.inputs.rememberToken = false;
      this.$emit("login", this.inputs);
    },
    async removeSavedLogin(index) {
      const backup = JSON.parse(
        JSON.stringify(this.apx.data.savedAuthorizations),
      );
      backup.splice(index, 1);
      invoke("set_authorizations", { data: JSON.stringify(backup) }).then(
        (e) => {
          invoke("app_load");
        },
      );
    },
    handleChipChange(val) {
      if (val === "New login") {
        this.goToPage("login");
      } else {
        this.goToPage("saved");
      }
    },
    goToPage(page) {
      this.currentSubPage = page;
      const carousel = this.$refs.carousel;
      if (carousel) {
        const pageIndex = this.currentSubPage === "login" ? 1 : 0;

        setTimeout(() => {
          // For some sizing issues, we need to wait a bit
          // Also nice animation
          carousel.setIndex(pageIndex);
        }, 80);
      }
    },
  },
};
</script>
