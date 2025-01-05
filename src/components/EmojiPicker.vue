<style lang="scss" scoped>
*::-webkit-scrollbar {
  width: 6px;
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background-color: var(--primary-color);
  transition: all 50ms;
  border-radius: 20px;
  cursor: pointer;

  &:hover {
    background-color: var(--primary-muted-color);
  }
}

.emoji-picker {
  position: relative;
  height: 300px;
  width: 450px;
  background-color: var(--button-color-muted);

  border-radius: var(--radius-md);
  overflow: auto;

  .filter-bar {
    position: sticky;
    inset: 0 0 auto 0;
    padding-top: var(--gap-md);
    margin-bottom: var(--gap-sm);
    background-color: inherit;
    border-bottom: 2px solid var(--button-color);
    padding: var(--gap-md);

    input[type="text"],
    input:-internal-autofill-selected {
      display: block;
      width: 100%;
      padding: var(--gap-sm);
      background-color: var(--button-color);
      color: var(--text-color);
      border: none;
      font-size: 16px;
      border-radius: 5px;
    }

    input[type="text"]:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px var(--primary-color);
    }
  }

  .emoji-groups {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(1em, 1fr));
    gap: var(--gap-sm);
    justify-content: center;
    padding: var(--gap-md);
    padding-top: 0;
    font-size: 1.5rem;

    .clickable-emoji {
      width: 30px;
      height: 30px;
      display: grid;
      place-items: center;
      background-color: var(--button-color-muted);
      transition: all 150ms;
      border-radius: var(--radius-sm);

      &:hover {
        background-color: var(--button-color);
      }
    }
  }
}
</style>

<template>
  <div class="emoji-picker" @click="handleClick">
    <div class="filter-bar">
      <Input type="text" id="emojiPickerInputBox" v-model="searchQuery" placeholder="Search emojis..." />
    </div>
    <div class="emoji-groups">
      <div v-for="emoji in twemojiData" :key="emoji.hexcode" :id="`emoji_${emoji.hexcode}`" :data-m-label="emoji.label"
        :data-m-group="emoji.group" class="clickable-emoji" @click="pickEmoji(emoji)">
        <span class="emoji-wrapper">
          <img :src="emoji.url" class="emoji" loading="lazy" :alt="emoji.unicode">
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import twemoji from "twemoji";
import Input from "./base/Input.vue";
import { useAppStore } from "../stores/app";

export default {
  components: { Input },
  data() {
    return {
      searchQuery: "",
      emojis: useAppStore().utils.emojiData,
    };
  },
  emits: ["picked"],
  methods: {
    pickEmoji(emoji) {
      this.$emit("picked", emoji);
    },
    handleClick(ev) {
      ev?.stopPropagation();
      console.log("Clicked outside");
    }
  },
  computed: {
    twemojiData() {
      let data = [];
      for (let index = 0; index < this.emojis.length; index++) {
        const emoji = this.emojis[index];
        if (
          this.searchQuery &&
          Array.isArray(emoji.tags) &&
          !emoji.tags.some((tag) => tag.toLowerCase().includes(this.searchQuery.toLowerCase())) &&
          !emoji.label.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
          continue;
        const newEmoji = twemoji.parse(emoji.unicode, {
          base: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/",
        });
        const htmlElement = newEmoji.match(/<[^>]+>/g)?.[0] || "";
        emoji.html = htmlElement;
        if (emoji.html) data.push(emoji);
      }
      data = data.sort((a, b) => {
        // If both emojis have a group, sort by group and then by order
        if (a.group !== undefined && b.group !== undefined) {
          if (a.group < b.group) return -1;
          if (a.group > b.group) return 1;
          if (a.order < b.order) return -1;
          if (a.order > b.order) return 1;
          return 0;
        }
        // If only one emoji has a group, it should come first
        if (a.group !== undefined && b.group === undefined) return -1;
        if (a.group === undefined && b.group !== undefined) return 1;
        // If neither emoji has a group, sort by order
        if (a.order < b.order) return -1;
        if (a.order > b.order) return 1;
        return 0;
      });

      for (const emoji of data) {
        const image = new DOMParser().parseFromString(emoji.html, "text/html").querySelector("img");
        if (image) {
          emoji.url = image.src;
        }
      }

      return data;
    },
  },
};
</script>
