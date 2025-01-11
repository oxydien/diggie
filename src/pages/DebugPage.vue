<style scoped lang="scss">
.debug-wrapper {
  display: grid;
  overflow: auto;
  height: 100%;
  width: 100%;
  max-width: 100%;

  pre {
    max-width: 600px;
  }
}
</style>

<template>
  <div class="debug-wrapper">
    <div class="debug-contents">
      <h1>Debug</h1>

      <h3>App state</h3>
      <div class="state">
        <pre>{{ JSON.stringify(apx, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "../stores/app";

const apx = useAppStore();
</script>
