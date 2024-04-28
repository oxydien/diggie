<style lang="scss" scoped>
img,svg {
  width: 100%;
  height: 100%;
}
</style>

<template>
  <img v-if="src && !hadError" ref="img" :src="src" :alt="alt" :loading="loading" @error="hadError = true" />
  <PersonIcon v-else />
</template>

<script>
import PersonIcon from "../icons/PersonIcon.vue";

export default {
	components: { PersonIcon },
	data() {
		return {
			hadError: false,
		};
	},
	props: {
		src: {
			type: String,
			default: null,
		},
		alt: {
			type: String,
			default: "",
		},
		loading: {
			type: String,
			default: "lazy",
		},
	},
};
</script>