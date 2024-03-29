<style lang="scss" scoped>
.attachment-vizualizer-wrapper {
  position: relative;
  max-height: 130px;
  max-width: 110px;
  overflow: hidden;

  .embed-data {
    transform-origin: top left;
    transform: scale(0.6);
    width: 170%;
    background-color: var(--button-color);
    border-radius: var(--radius-md);
    padding: var(--gap-sm);

    h4 {
      margin: 0;
      margin-top: var(--gap-sm);
    }

    * {
      overflow-wrap: break-word;
    }
  }
}
</style>

<template>
  <div class="attachment-vizualizer-wrapper">
    <div
      class="embed-data"
      :style="`border-left: 5px solid #${embedData.color || embedData.color === 0 ? embedData.color.toString(16) : ''}`"
    >
      <h4>{{ embedData.title }}</h4>
      <p>{{ embedData.description }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    embedData: {
      type: Object,
      required: true,
    },
  },
};
</script>
