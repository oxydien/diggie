<template>
  <div class="markdown-content" v-html="parsedData"></div>
</template>

<script lang="ts">
import twemoji from "twemoji";
import {MarkdownParser} from "../../stores/static.js";

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
      if (!MarkdownParser.value) {
        console.error("ERROR", "MarkdownParser", "called before being loaded");
        return;
      }

      let md = this.markdown.trim();

      // Fix newlines (discord uses only single newlines, markdown uses double)
      md = md.replaceAll("\n", "\n\n");
      // Fix code blocks
      md = md.replace(/```(.)/g, (match, p1) => {
        return p1 === p1.toLowerCase() && /^[a-z]+$/.test(p1)
          ? match
          : `\`\`\`\n${p1}`;
      });

      // Parse markdown to HTML
      let data = MarkdownParser.value.render(md).trim();

      // Parse timestamps
      data.replace(/<t:(\d+):[a-zA-Z_]>/g, (match, timestampValue) => {
          console.log(match, timestampValue);
          const date = new Date(Number.parseInt(timestampValue) * 1000);
          return date.toLocaleString();
        });

      // Fix newlines (discord uses only single newlines, markdown uses double)
      data = data.replaceAll("\n", "");

      // Fix spoilers
      data = data.replace(/(\|\|)(.*?)(\|\|)/g, (match, prefix, spoilerText, suffix) => {
          return `<spoiler-placeholder class="spoiler-placeholder">${spoilerText.trim()}</spoiler-placeholder>`;
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
