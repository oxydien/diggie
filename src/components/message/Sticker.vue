<style lang="scss" scoped>
.sticker {
  width: 7em;
  height: 7em;
}
</style>

<template>
  <img class="sticker" v-bind:data-raw="JSON.stringify(sticker)" :src="imgSrc"
    :alt="`${sticker.name} ${sticker.description}`" @mouseover="hover = true" @mouseleave="hover = false" />
</template>

<script>
export default {
  name: "Sticker",
  props: {
    sticker: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      hover: false,
    };
  },
  computed: {
    imgSrc() {
      return `https://media.discordapp.net/stickers/${this.sticker.id}.${(this.hover) ? 'gif' : 'webp'}?size=160&quality=lossless`;
    },
  },
};
</script>
