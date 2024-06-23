<style lang="scss" scoped>
.login-wrapper {
  display: flex;
  flex-flow: column nowrap;
  gap: var(--gap-md);
  margin-top: var(--gap-md);

  .saved-logins-reminder span {
    color: var(--primary-color);
    cursor: pointer;
  }

  .token-visibility-toggle {
    max-width: fit-content;
    padding: var(--gap-sm);
  }

  .remember-token {
    display: grid;
    place-items: center;
    margin-bottom: var(--gap-md);

    .remember-warning {
      color: #e67e34;
      font-weight: 600;
      margin: 0;
    }
  }
}
.saved-logins-wrapper {
  display: grid;
  grid-template-rows: 25px auto 40px;
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
</style>

<template>
  <div class="login-form">
    <div
      class="saved-logins-wrapper"
      v-if="apx.data.savedAuthorizations != [] && !ignoreSavedLogins"
    >
      <p>Your saved logins:</p>
      <div class="list-of-logins">
        <div class="saved-login" v-for="(login, index) in apx.data.savedAuthorizations">
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
          <Button
            class="remove-button"
            :loading="apx.logging"
            color="secondary"
            @dblclick="removeSavedLogin(index)"
          >
            <DeleteIcon />
          </Button>
          <Button
            class="login-button"
            :loading="apx.logging"
            color="primary"
            @click="handleSavedLogin(login)"
          >
            <ArrowIcon style="transform: rotate(-90deg)" />
          </Button>
        </div>
      </div>
      <Button @click="ignoreSavedLogins = !ignoreSavedLogins" color="primary">
        Manual login <ArrowIcon style="transform: rotate(-90deg)" />
      </Button>
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
        <IconifiedInput
          v-model="inputs.token"
          :rightIcon="true"
          :type="tokenVisible ? 'text' : 'password'"
          placeholder="Put your bot token here..."
        >
          <Button
            class="token-visibility-toggle"
            @click="tokenVisible = !tokenVisible"
          >
            <EyeVisibleIcon v-if="!tokenVisible" />
            <EyeHiddenIcon v-else />
          </Button>
        </IconifiedInput>
      </div>
      <div class="remember-token">
        <Checkbox v-model="inputs.rememberToken">Remember token</Checkbox>
        <p v-if="inputs.rememberToken" class="remember-warning">
          [WARNING] This will save the token <br />
          to your local hardrive with weak encryption
        </p>
      </div>
      <Button
        @click="handleLogin"
        color="primary"
        class="login-button"
        :loading="apx.logging"
      >
        Login
      </Button>
    </div>
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

export default {
	components: {
		EyeVisibleIcon,
		EyeHiddenIcon,
		ArrowIcon,
		DeleteIcon,
		Button,
		Checkbox,
		IconifiedInput,
	},
	data() {
		return {
			apx: useAppStore(),
			tokenVisible: false,
			ignoreSavedLogins: false,
			inputs: {
				token: "",
				rememberToken: false,
			},
		};
	},
	emits: ["login"],
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
	},
};
</script>
