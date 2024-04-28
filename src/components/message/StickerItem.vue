<template>
  <img :src="`https://media.discordapp.net/stickers/${sticker.id}.webp?size=240`" :alt="sticker.name" />
</template>

<script>
export default {
  props: {
    sticker: {
      type: Object,
      required: true,
    },
  },
};
</script>
