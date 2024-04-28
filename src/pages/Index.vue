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
      <div class="loading" v-if="apx.logging || isLoading">
        <LoadingIcon :animated="true" />
      </div>
      <h1 @click.prevent="headingEasterEgg">
        D<span>i</span>gg<span>i</span>e
      </h1>
      <h3>a simple Discord client for bots</h3>
      <LoginForm @login="handleLogin" />
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
import { login } from "../core/discord/auth";
import LoadingIcon from "../components/icons/LoadingIcon.vue";
import LoginForm from "../components/forms/LoginForm.vue";
import ArrowIcon from "../components/icons/ArrowIcon.vue";

export default {
	components: { ArrowIcon, LoadingIcon, LoginForm },
	data() {
		return {
			apx: useAppStore(),
			lastHeadingClick: null,
			isLoading: true,
		};
	},
	mounted() {
		this.apx.layout.showChannels = this.apx.isLoggedIn;
		this.apx.layout.showServers = this.apx.isLoggedIn;

		this.$nextTick(() => {
			this.isLoading = false;
		});
	},
	methods: {
		handleLogin(data) {
			login(data.token, data.rememberToken);
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
