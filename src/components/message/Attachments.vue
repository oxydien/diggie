<style lang="scss" scoped>
.attachment-wrapper:not(:empty) {
  height: 160px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: var(--gap-sm);
  border-top: 1px solid var(--button-color);

  .attachment {
    position: relative;
    display: grid;
    place-items: center;
    width: 150px;
    height: 150px;

    padding: var(--gap-sm);
    background-color: var(--button-color-muted);
    border-radius: var(--radius-sm);
    overflow: hidden;

    .remove-attachment-button {
      position: absolute;
      top: var(--gap-sm);
      right: var(--gap-sm);
      display: grid;
      place-items: center;
      height: 20px;
      width: 20px;
      padding: 0;
      background-color: var(--primary-muted-color);
      color: var(--text-color);
      border: none;
      font-size: 16px;
      border-radius: 5px;
      z-index: 27;
    }
  }
}
</style>

<template>
  <div id="attachments">
    <div class="attachment-wrapper">
      <div class="embed-attachment attachment" v-for="(embed, embed_index) in apx.data.textInput.message.embeds">
        <button class="remove-attachment-button" @click="removeEmbedAttachment(embed_index)"><DeleteIcon /></button>
        <MiniEmbedAttachment :embedData="embed" />
      </div>
    </div>
  </div>
</template>

<script>
import { useAppStore } from "../../stores/app";
import MiniEmbedAttachment from "./attachments/MiniEmbedAttachment.vue";
import DeleteIcon from "../icons/DeleteIcon.vue";
export default {
  components: { MiniEmbedAttachment, DeleteIcon },
  data() {
    return {
      apx: useAppStore(),
    };
  },
  methods: {
    removeEmbedAttachment(index) {
      this.apx.data.textInput.message.embeds.splice(index, 1);
    },
  },
};
</script>
