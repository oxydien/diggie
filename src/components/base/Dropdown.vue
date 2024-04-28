<style lang="scss" scoped>
.dropdown-wrapper {
  position: relative;
  width: 100%;

  .dropdown-toggle {
    display: flex;
    align-items: center;
    gap: var(--gap-md);
    justify-content: space-between;
    width: inherit;

    color: var(--text-color);
    background-color: var(--button-color);
    padding: 0.7rem;
    border-radius: var(--radius-sm);
    transition: all 120ms;
    outline: 2px solid transparent;
    border: none;

    font-weight: inherit;
    font-size: inherit;
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid var(--primary-color-highlighted);
      filter: brightness(80%);
    }

    .dropdown-arrow {
      transition: 120ms transform;
    }

    &.opened {
      border-radius: var(--radius-sm) var(--radius-sm) 0 0;

      .dropdown-arrow {
        transform: rotate(-90deg);
      }

      &.open-up {
        border-radius: 0 0 var(--radius-sm) var(--radius-sm);

        .dropdown-arrow {
          transform: rotate(90deg);
        }
      }
    }
  }

  .dropdown-content {
    position: absolute;
    top: 100%;
    left: 0;
    display: flex;
    flex-flow: column nowrap;
    gap: var(--gap-sm);
    width: inherit;
    max-height: 200px;

    transition: 120ms transform;
    background-color: var(--foreground-color);
    padding: 0.7rem;
    border-radius: 0 0 var(--radius-md) var(--radius-md);
    overflow-x: hidden;
    overflow-y: auto;
    transform-origin: top center;
    transform: scaleY(0);
    z-index: 72;

    &.open-up {
      transform-origin: bottom center;
      top: unset;
      bottom: 100%;
    }

    &.opened {
      transform: scaleY(1);
    }
  }
}
</style>

<template>
  <div class="dropdown-wrapper" aria-label="Dropdown">
    <button
      id="dropdown-toggle"
      aria-haspopup="true"
      :aria-expanded="isOpened"
      :class="{ opened: isOpened, 'open-up': openUp }"
      class="dropdown-toggle"
      @click="toggleDropdown"
      aria-controls="dropdown-content"
      :aria-label="placeholder || 'Select an option'"
    >
      <span>{{
        selected
          ? selected.name
          : false || placeholder || proppedValName || parsedOptions[0].name
      }}</span>
      <ArrowIcon
        v-if="showDefaultIcon"
        aria-hidden="true"
        class="dropdown-arrow"
      />
      <slot />
    </button>
    <div
      id="dropdown-content"
      class="dropdown-content"
      :class="{ opened: isOpened, 'open-up': openUp }"
      role="menu"
      aria-labelledby="dropdown-toggle"
    >
      <Button
        v-for="option in parsedOptions"
        :key="option.value"
        :color="currentValue === option.value ? 'primary' : ''"
        role="menuitem"
        :tabindex="isOpened ? '0' : '-1'"
        @click="changeOption(option)"
      >
        {{ option.name }}
      </Button>
    </div>
  </div>
</template>

<script>
import ArrowIcon from "../icons/ArrowIcon.vue";
import Button from "./Button.vue";

export default {
  components: { ArrowIcon, Button },
  data() {
    return {
      isOpened: false,
      selected: null,
      currentValue: null,
      showDefaultIcon: true,
    };
  },
  emits: ["change", "open"],
  props: {
    options: {
      type: Array,
      required: true,
      default: [],
    },
    currentVal: null,
    placeholder: String,
    openUp: {
      type: Boolean,
      default: false,
    },
  },
  mounted() {
    this.currentValue = this.currentVal || this.parsedOptions[0].value;
    if (this.$slots.default) {
      this.showDefaultIcon = false;
    }
  },
  methods: {
    toggleDropdown() {
      this.isOpened = !this.isOpened;
      this.$emit("open", this.isOpened);

      if (this.isOpened) {
        setTimeout(() => {
          document.addEventListener("click", this.closeDropdown, {
            once: true,
          });
        }, 0);
      }
    },
    closeDropdown() {
      this.isOpened = false;
      this.$emit("open", this.isOpened);
    },
    changeOption(option) {
      this.currentValue = option.value;
      this.selected = option;
      this.$emit("change", option.value);
    },
  },
  computed: {
    parsedOptions() {
      const output = [];
      for (let index = 0; index < this.options.length; index++) {
        const element = this.options[index];
        if (
          Object.prototype.toString.call(element) === "[object Object]" &&
          !Array.isArray(element)
        ) {
          output.push(JSON.parse(JSON.stringify(element)));
        } else {
          output.push({
            name: element,
            value: index,
          });
        }
      }
      return output;
    },
    proppedValName() {
      if (!this.currentVal) return null;
      const found = this.parsedOptions.find((e) => e.value === this.currentVal);
      if (found) {
        return found.name;
      }
      return null;
    },
  },
};
</script>
