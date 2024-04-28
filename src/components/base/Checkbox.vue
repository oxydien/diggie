<style lang="scss" scoped>
.checkbox-wrapper {
  display: flex;
  gap: var(--gap-sm);
  color: var(--text-color);
  margin-top: var(--gap-sm);
  user-select: none;

  .checkbox {
    width: 1.4em;
    height: 1.4em;
    aspect-ratio: 1/1;
    border-radius: var(--radius-sm);
    background-color: var(--button-color);
    border: none;
    padding: 0;
    cursor: pointer;

    &.checked {
      background-color: var(--primary-color);
    }
  }
}
</style>
<template>
  <div @click="toggle" role="presentation" class="checkbox-wrapper">
    <button
      role="checkbox"
      type="button"
      class="checkbox"
      :disabled="disabled"
      :class="{ checked: modelValue }"
      :aria-label="description"
      :aria-checked="modelValue"
    >
      <CheckIcon v-if="modelValue" aria-hidden="true" />
    </button>
    <span>
      <slot />
    </span>
  </div>
</template>
<script>
import CheckIcon from "../icons/CheckIcon.vue";

export default {
  components: { CheckIcon },
  props: {
    label: { type: String, default: "" },
    disabled: { type: Boolean, default: false },
    description: { type: String, default: "" },
    modelValue: { type: Boolean, required: true, default: false },
    clickEvent: { type: Function, default: () => {} },
  },
  emits: ["update:modelValue"],
  methods: {
    toggle() {
      if (!this.disabled) {
        this.$emit("update:modelValue", !this.modelValue);
      }
    },
  },
};
</script>
