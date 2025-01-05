<style lang="scss" scoped>
.custom-emoji {
  display: inline-block;
  width: 1em;
  height: 1em;
}
</style>

<template>
  <img v-if="emoji.id" class="custom-emoji" :src="`https://cdn.discordapp.com/emojis/${emoji.id}.webp?size=96`" :alt="emoji.name">
</template>

<script>
export default {
  props: {
    emoji: {
      type: Object,
      required: true,
    },
  }
}
</script>