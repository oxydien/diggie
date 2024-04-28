<style lang="scss" scoped>
.embed-container {
  position: relative;
  display: block;

  width: fit-content;
  max-width: 500px;

  background-color: var(--button-color);

  box-sizing: border-box;
  padding: 8px;
  border-radius: 8px;
  margin-bottom: 5px;

  .embed-author {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: var(--gap-sm);

    .author-icon {
      width: 1em;
      height: 1em;
    }
  }

  .embed-title {
    h3 {
      margin: 0;
      margin-top: var(--gap-sm);
    }
  }

  * {
    overflow-wrap: break-word;
  }
}

.embed-thumbnail {
  float: right;
  width: 80px !important;
  height: 80px !important;
  margin-left: var(--gap-md);
  object-fit: contain;
}

.embed-field-container h4 {
  margin: 0;
}

.embed-field-inline {
  display: inline-block;
  margin-left: 1.8rem;
}

.embed-footer img {
  width: 10px !important;
  height: 10px !important;
}

.embed-footer-timestamp,
.embed-footer-text {
  margin-top: 1rem;
  margin-left: 0.5rem;
  font-size: 0.6rem;
  font-weight: 500;
}

.embed-video-container,
.embed-gif-container,
.embed-image-container {
  img,
  video {
    max-width: 100%;
    height: unset !important;
  }
}

.embed-container iframe {
  width: 100%;
  aspect-ratio: 16/9;
}

.embed-video {
  width: fit-content;
  height: fit-content;
  max-width: fit-content;
  max-height: fit-content;

  position: relative;

  border-radius: 8px;
  transition: all 200ms;
  overflow: hidden;

  video {
    width: 100% !important;
    height: unset !important;
  }
}

img,
video {
  max-width: 30vw !important;
  max-height: 35vh !important;
}
</style>

<template>
  <div class="embed-gif-container" v-if="embed.type === 'image'">
    <img :src="embed.thumbnail.url" class="gif-image" />
  </div>
  <div class="embed-gif-container" v-else-if="embed.type === 'article' && embed.thumbnail">
    <img :src="embed.thumbnail.url" class="gif-image" />
  </div>
  <div class="embed-gif-container" v-else-if="embed.type === 'gifv'">
    <video :src="embed.video.url" controls autoplay muted loop class="gif-image" v-observe-visibility></video>
  </div>
  <div
    class="embed-container"
    v-else
    :style="`border-left: 5px solid #${embed.color || embed.color === 0 ? embed.color.toString(16) : ''}`"
  >
    <div v-if="embed.author" class="embed-author">
      <img
        v-if="embed.author.icon_url != ''"
        :src="embed.author.icon_url"
        :alt="`${embed.author.name}'s icon`"
        class="author-icon"
      />
      <span class="author-name" v-if="embed.author.url == ''">{{ embed.author.name }}</span>
      <a class="author-name" v-else :href="embed.author.url">{{ embed.author.name }}</a>
    </div>
    <img
      v-if="embed.thumbnail && embed.thumbnail.url != ''"
      class="embed-thumbnail"
      :src="embed.thumbnail.url"
      width="80"
      @click="fullImage(embedThumbnailImg)"
    />
    <div class="embed-title" v-if="embed.title">
      <h3>{{ embed.title }}</h3>
    </div>
    <div v-if="embed.description" class="embed-description"><MarkdownParser :markdown="embed.description" /></div>
    <div
      v-if="embed.fields && embed.fields.length > 0"
      class="embed-field-container"
      :class="{ 'embed-field-inline': field.inline }"
      v-for="field in embed.fields"
      :key="field.name"
    >
      <h4><MarkdownParser :markdown="field.name" /></h4>
      <span><MarkdownParser :markdown="field.value" /></span>
    </div>
    <div v-if="embed.image && embed.image.url != ''" class="embed-image-container">
      <img :src="embed.image.url" />
    </div>
    <div v-if="embed.video" class="embed-video">
      <iframe
        v-if="embed.video.url.startsWith('https://www.youtube.com/embed/')"
        :src="embed.video.url"
        frameborder="0"
        class="video"
      ></iframe>
      <div v-else class="video-holder">
        <div class="video-timeline-holder">
          <div class="video-timeline"></div>
          <div class="video-timeline-overlay"></div>
        </div>
        <div class="video-maximize"></div>
        <div class="video-play"></div>
        <video :src="embed.video.url" controls class="video" v-observe-visibility></video>
      </div>
    </div>
    <div v-if="embed.footer && embed.footer.text" class="embed-footer">
      <img :src="embed.footer.icon_url" width="10" />
      <span class="embed-footer-text">{{ embed.footer.text }}</span>
      <span class="embed-footer-timestamp" v-if="embed.timestamp">{{
        new Date(embed.timestamp).toLocaleTimeString()
      }}</span>
    </div>
  </div>
</template>

<script>
import MarkdownParser from "./MarkdownParser.vue";

export default {
  components: { MarkdownParser },
  props: {
    embed: Object,
  },
  methods: {
    fullImage(embedThumbnailImg) {
      // Implement fullImage function
    },
  },
};
</script>
