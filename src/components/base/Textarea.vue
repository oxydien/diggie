<style lang="scss" scoped>
textarea {
  width: var(--_chat-input-width);
  min-height: 40px;
  background-color: var(--button-color);
  color: var(--text-color);
  border-radius: var(--radius-sm);
  border: none;
  margin-top: var(--gap-sm);
  padding: 0.2rem 0.2rem 0 0.7rem;
  font-size: 1.2rem;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  resize: none;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--primary-color);
  }

  &::placeholder {
    color: var(--text-color-muted);
  }
}
</style>

<template>
  <textarea wrap="hard" rows="1" ref="textarea" @input="handleInput">{{ modelValue }}</textarea>
</template>

<script>
export default {
  data() {
  },
  props: {
    modelValue: { type: String, required: true, default: "" },
  },
  watch: {
  },
  emits: ["update:modelValue"],
  expose: ["focus"],
  methods: {
    focus() {
      this.$refs.textarea.focus();
    },
    handleInput(event) {
      const value = event.target.value;
      event.target.rows = Math.min(10, this.countLines(event.target));
      this.$emit("update:modelValue", value);
    },
    countLines(textarea) {
      let _buffer;
      if (!_buffer) {
        _buffer = document.createElement("textarea");
        _buffer.style.border = "none";
        _buffer.style.height = "0";
        _buffer.style.overflow = "hidden";
        _buffer.style.padding = "0";
        _buffer.style.position = "absolute";
        _buffer.style.left = "0";
        _buffer.style.top = "0";
        _buffer.style.zIndex = "-1";
        document.body.appendChild(_buffer);
      }

      const cs = window.getComputedStyle(textarea);
      const pl = Number.parseInt(cs.paddingLeft);
      const pr = Number.parseInt(cs.paddingRight);
      let lh = Number.parseInt(cs.lineHeight);

      if (Number.isNaN(lh)) lh = Number.parseInt(cs.fontSize);

      _buffer.style.width = `${textarea.clientWidth - pl - pr}px`;
      _buffer.style.font = cs.font;
      _buffer.style.letterSpacing = cs.letterSpacing;
      _buffer.style.whiteSpace = cs.whiteSpace;
      _buffer.style.wordBreak = cs.wordBreak;
      _buffer.style.wordSpacing = cs.wordSpacing;
      _buffer.style.wordWrap = cs.wordWrap;

      _buffer.value = textarea.value;

      let result = Math.floor(_buffer.scrollHeight / lh);
      if (result === 0) result = 1;
      if (_buffer) {
        document.body.removeChild(_buffer);
      }
      return result;
    },
  },
};
</script>
