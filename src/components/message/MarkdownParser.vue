<template>
  <div class="markdown-content" v-html="parsedData"></div>
</template>

<script>
import { useAppStore } from "../../stores/app";
import twemoji from "twemoji";

export default {
  data() {
    return {
      parsedData: "",
    };
  },
  props: {
    markdown: {
      type: String,
      required: true,
      default: "",
      md: null,
    },
  },
  watch: {
    markdown() {
      this.parseData();
    },
  },
  mounted() {
    this.parseData();
  },
  emits: ["loaded"],
  methods: {
    parseData() {
      let md = this.markdown.trim();

      md = md.replaceAll("\n", "\n\n");

      let data = useAppStore()
        .utils.markdown.render(md)
        .trim()
        .replace(/<t:(\d+):[a-zA-Z_]>/g, (match, timestamp) => {
          console.log(match, timestamp);
          const date = new Date(Number.parseInt(timestamp) * 1000);
          return date.toLocaleString();
        })
        .replaceAll("\n", "")
        .replace(/(\|\|)(.*?)(\|\|)/g, (match, p1, p2, p3) => {
          return `<spoiler-placeholder class="spoiler-placeholder">${p2.trim()}</spoiler-placeholder>`;
        });

      data = twemoji.parse(data, {
        base: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/",
      });

      this.$emit("loaded");
      this.parsedData = data;
    },
  },
};
</script>
