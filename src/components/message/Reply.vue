<style lang="scss" scoped>
.reply-wrapper {
  position: relative;
  display: flex;
  flex-flow: row nowrap;
  gap: var(--gap-sm);
  max-width: 300px;
  background-color: var(--background-color);
  border-radius: var(--radius-sm);
  text-overflow: ellipsis;
  font-size: 0.8rem;
  text-wrap: nowrap;
  white-space: nowrap;

  .reply-icon {
    position: absolute;
    left: -20px;
    top: 4px;
    transform: rotate(180deg) scaleX(-1);
  }
  .reply-content {
    overflow: hidden;
  }

  .reply-profile-holder {
    img {
      border-radius: 12px;
    }
  }
}
</style>

<template>
  <div class="reply-wrapper" v-if="message_reference">
    <ReplyIcon class="reply-icon" />
    <!-- {{ message }} -->
    <div class="reply-profile-holder">
      <img
        :src="`https://cdn.discordapp.com/avatars/${message_reference.author.id}/${message_reference.author.avatar}.webp?size=16`"
      />
    </div>
    <strong class="reply-author-name">{{
      message_reference.author.global_name || message_reference.author.username
    }}</strong>
    <span class="reply-content"
      >{{ message_reference.content }}
      <em v-if="message_reference.content.trim() === '' && message.attachments.lenght > 0">Attachment...</em></span
    >
  </div>
</template>

<script>
import ReplyIcon from "../icons/ReplyIcon.vue";
export default {
  components: { ReplyIcon },
  props: {
    message_reference: {
      type: Object,
      default: null,
    },
    message: {
      type: Object,
      required: true,
    },
  },
};
</script>
