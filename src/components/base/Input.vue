<style lang="scss" scoped>
input {
  width: 100%;
  color: var(--text-color);
  padding: var(--gap-sm) var(--gap-md);
  background-color: var(--button-color-muted);
  transition: all 120ms;
  border-radius: var(--radius-sm);
  outline: 2px solid transparent;
  font-size: 1.2rem;
  border: none;

  &:focus-visible {
    outline-color: var(--primary-color);
  }

  &::placeholder {
    color: var(--text-color-muted);
  }
}
</style>

<template>
  <input
    :type="type"
    :id="id"
    :placeholder="placeholder"
    @input="$emit('update:modelValue', $event.target.value)"
    :value="modelValue ? modelValue : ''"
    :required="required"
  />
</template>

<script>
export default {
  props: {
    id: String,
    type: String,
    placeholder: String,
    modelValue: null,
    required: Boolean,
  },
  emits: ["update:modelValue"],
};
</script>
