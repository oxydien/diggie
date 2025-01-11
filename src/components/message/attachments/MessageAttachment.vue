<!-- Used in Message.vue -->
<style lang="scss" scoped>
.attachment {
  max-width: 30dvw;
  max-height: 400px;

  video,
  img {
    max-width: 30dvw;
    max-height: 400px;
  }

  .file-download {
    display: grid;
    grid-template: "filename download" "info download";
    gap: var(--gap-sm);
    align-items: center;
    justify-content: space-between;
    padding: var(--gap-md);
    background-color: var(--button-color);
    border-radius: var(--radius-md);

    .filename {
      grid-area: filename;
    }

    .file-info {
      display: flex;
      flex-flow: row nowrap;
      gap: var(--gap-sm);
      grid-area: info;
    }

    .file-buttons {
      display: flex;
      flex-flow: row nowrap;
      gap: var(--gap-sm);
      grid-area: download;
    }
  }
}
</style>

<template>
  <div class="attachment" @contextmenu.capture="attachmentContextMenu($event, file)">
    <img :src="file.url" v-if="file.content_type?.includes('image')" />
    <div v-else-if="file.content_type?.includes('video')">
      <video :src="file.url" controls v-if="isVideoAllowed" v-observe-visibility></video>
      <p v-else class="video-warn">Video not allowed: {{ file.url }}</p>
    </div>
    <div class="file-download" v-else>
      <em class="filename">{{ file.filename }}</em>
      <div class="file-info">
        <span class="file-size">{{ sizeReadable }}</span>
        <span class="file-type">{{ readableContentType }}</span>
      </div>
      <div class="file-buttons">
        <Button @click="copyUrl(file.url)">
          <CheckIcon v-if="copied" />
          <LinkIcon v-else />
        </Button>
        <Button color="secondary" @click="downloadFile(file.url)">
          <DownloadIcon />
        </Button>
      </div>
    </div>
  </div>
</template>

<script>
import DownloadIcon from "../../icons/DownloadIcon.vue";
import Button from "../../base/Button.vue";
import { useAppStore } from "../../../stores/app";
import LinkIcon from "../../icons/LinkIcon.vue";
import CheckIcon from "../../icons/CheckIcon.vue";

export default {
  name: "MessageAttachment",
  components: {
    DownloadIcon,
    LinkIcon,
    Button,
    CheckIcon
  },
  data() {
    return {
      copied: false,
    }
  },
  props: {
    file: {
      type: Object,
      required: true,
    },
  },
  methods: {
    attachmentContextMenu(event, attachment) {
      // Prevent Message context menu from showing on attachment right-click
      event.stopPropagation();
    },
    downloadFile(url) {
      // This doesn't work for some reason, probably have to do this with backend
      // TODO: Download file backend
      const link = document.createElement("a");
      link.href = url;
      link.download = this.file.filename;
      link.click();
    },
    copyUrl(url) {
      if (this.copied) return;
      try {
        navigator.clipboard.writeText(url);
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 1000);
      } catch (err) {
        console.error(err);
      }
    },
  },
  computed: {
    isVideoAllowed() {
      return useAppStore().utils.clientSettings?.render_videos ?? true;
    },
    sizeReadable() {
      const size = this.file.size;
      if (size < 1024) {
        return `${size} bytes`;
      } if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(2)} KB`;
      } if (size < 1024 * 1024 * 1024) {
        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
      }
      return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    },
    readableContentType() {
      if (!this.file.content_type) return "";
      return this.file.content_type.split(";")[0];
    }
  },
};
</script>
