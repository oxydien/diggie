<style lang="scss" scoped>
.iconified-input {
  display: flex;
  gap: var(--gap-md);
  align-items: center;
  width: 100%;
  color: var(--text-color);
  transition: all 120ms;
  padding: var(--gap-md);
  background-color: var(--highlighted-foreground-color);
  border-radius: var(--radius-sm);
  outline: 2px solid transparent;
  font-size: 1.2rem;

  &:focus-within {
    outline-color: var(--primary-color);
    color: var(--text-color-highlighted);
  }

  &.right-icon {
    flex-flow: row-reverse nowrap;
  }

  input {
    width: 100%;
    height: 100%;
    background-color: transparent;
    font-family: inherit;
    font-size: inherit;
    padding: 0;
    margin: 0;
    color: inherit;
    border: none;
    outline: none;
  }
}
</style>

<template>
  <div
    class="iconified-input"
    :class="{ 'right-icon': rightIcon }"
    @click="handleClick"
  >
    <slot />
    <input
      ref="IconifiedInput"
      :type="type"
      :id="id"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
      :required="required"
    />
  </div>
</template>

<script>
export default {
  props: {
    id: String,
    type: String,
    placeholder: String,
    modelValue: null,
    required: Boolean,
    rightIcon: Boolean,
  },
  emits: ["update:modelValue"],
  methods: {
    handleClick(e) {
      this.$refs.IconifiedInput.focus();
    },
  },
};
</script>
