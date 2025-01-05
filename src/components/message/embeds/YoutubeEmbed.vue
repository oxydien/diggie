<style lang="scss" scoped>
.youtube-wrapper {
  display: grid;
  place-items: center;
  position: relative;
  min-height: 230px;
  overflow: hidden;
  border-radius: 8px;

  .youtube-disclaimer {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    background-color: var(--button-color);
    border-radius: 8px;
    color: var(--text-color);
    font-size: 1.5rem;
    font-weight: 600;
    cursor: pointer;
    text-align: center;
    user-select: none;
    z-index: 1;
  }

  iframe {
    width: 100%;
    height: 100%;
  }
}
</style>

<template>
  <div class="youtube-wrapper">
    <div class="youtube-disclaimer" v-if="!allowed" @click="loadVideo">
      <strong>Click here to load video</strong>
    </div>
    <iframe v-else :src="embedUrl" frameborder="0" allowfullscreen="1" class="video youtube-iframe"></iframe>
  </div>
</template>

<script>
export default {
  name: "YoutubeEmbed",
  data() {
    return {
      allowed: false
    }
  },
  props: {
    embedUrl: {
      type: String,
      required: true
    }
  },
  methods: {
    loadVideo() {
      this.allowed = true
    }
  }
}
</script>