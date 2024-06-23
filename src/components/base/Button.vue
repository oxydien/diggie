<style lang="scss" scoped>
.btn {
  --_bg-color: var(--button-color);
  --_bg-color-hover: var(--button-color-muted);
  --_bg-color-disabled: var(--button-color-muted);
  --_txt-color: var(--text-highlight-color);

  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  background-color: var(--_bg-color);
  padding: 0.7rem;
  border-radius: var(--radius-sm);
  transition: all 120ms;
  color: var(--_txt-color);
  font-weight: inherit;
  font-size: inherit;
  outline: 2px solid transparent;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: var(--_bg-color-hover);
  }

  &:focus-within,
  &:focus-visible {
    outline: 2px solid var(--primary-color-highlighted);
    filter: brightness(80%);
  }

  &:disabled {
    background-color: var(--_bg-color-disabled);
    cursor: not-allowed;
  }

  &.loading {
    display: flex;
    justify-content: center;
    align-items: center;

    svg {
      width: 20px;
    }
  }

  &.icon-only {
    width: 1em;
    aspect-ratio: 1/1;
    padding: var(--gap-sm);
    box-sizing: content-box;
  }

  &.btn-primary {
    --_bg-color: var(--primary-color);
    --_bg-color-hover: var(--primary-muted-color);
    --_bg-color-disabled: var(--primary-muted-color);
    --_txt-color: var(--text-button-color);
    text-shadow: 0 0 5px black;
  }

  &.btn-secondary {
    --_bg-color: var(--primary-muted-color);
    --_bg-color-hover: var(--primary-dark-color);
    --_bg-color-disabled: var(--primary-dark-color);
    --_txt-color: var(--text-button-color);
  }
}

.has-button {
  border-radius: var(--radius-sm);

  &:focus-within,
  &:focus-visible {
    outline: 2px solid var(--primary-color-highlighted);
    filter: brightness(80%);
  }
}
</style>

<template>
  <button
    v-if="loading"
    class="btn loading"
    :class="classes"
    :disabled="loading"
  >
    <LoadingDots />
  </button>
  <button
    v-else-if="!link"
    class="btn"
    :class="classes"
    :disabled="be_disabled"
  >
    <slot />
  </button>
  <a
    v-else-if="link.startsWith('http')"
    :href="link"
    class="has-button"
    :target="external ? '_blank' : '_self'"
  >
    <button class="btn" :class="classes" tabindex="-1" :disabled="be_disabled">
      <slot />
    </button>
  </a>
  <router-link
    v-else
    :to="link"
    class="has-button"
    :target="external ? '_blank' : '_self'"
  >
    <button class="btn" :class="classes" tabindex="-1" :disabled="be_disabled">
      <slot />
    </button>
  </router-link>
</template>

<script>
import LoadingDots from "../icons/LoadingDots.vue";

export default {
	components: { LoadingDots },
	props: {
		loading: Boolean,
		link: {
			type: String,
			default: "",
		},
		color: {
			type: String,
			default: "",
		},
		be_disabled: Boolean,
		external: Boolean,
		iconOnly: Boolean,
	},
	computed: {
		classes() {
			return {
				"btn-primary": this.color === "primary",
				"btn-secondary": this.color === "secondary",
				"icon-only": this.iconOnly,
			};
		},
	},
};
</script>
