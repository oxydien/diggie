<style scoped>
svg {
  animation: loadingRotation 1s forwards infinite linear;
}

@keyframes loadingRotation {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

<template>
  <svg
    :class="{ animated }"
    width="1em"
    height="1em"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M11 6C11 3.23858 8.76142 1 6 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>
</template>

<script>
export default {
  props: {
    animated: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
