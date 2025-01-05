<template>
  <ChatIcon v-if="channelType === 15" />
  <ChatIcon v-if="channelType === 12" />
  <ChatIcon v-if="channelType === 11" />
  <ChatIcon v-if="channelType === 10" />
  <SoundIcon v-else-if="channelType === 2" />
  <SoundIcon v-else-if="channelType === 13" />
  <MegaphoneIcon v-else-if="channelType === 5" />
  <HashIcon v-else />
</template>

<script>
import ChatIcon from "../icons/ChatIcon.vue";
import SoundIcon from "../icons/SoundIcon.vue";
import MegaphoneIcon from "../icons/MegaphoneIcon.vue";
import HashIcon from "../icons/HashIcon.vue";

export default {
  components: { ChatIcon, SoundIcon, MegaphoneIcon, HashIcon },
  props: {
    channelType: {
      type: Number,
      default: 0,
      required: true
    }
  }
}
</script>