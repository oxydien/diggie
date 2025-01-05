<style lang="scss" scoped>
.chip-wrapper {
  position: relative;

  display: flex;
  flex-flow: row;
  gap: var(--gap-sm) var(--gap-md);
  padding: var(--gap-sm);
  border-radius: var(--radius-lg);
  background-color: var(--foreground-color);
  isolation: isolate;

  &.vertical {
    flex-flow: column;
  }

  .option {
    width: 100%;
    padding: var(--gap-md);
    z-index: 5;
    cursor: pointer;
    user-select: none;
    transition: all 250ms;

    &.selected {
      color: var(--text-inverse-color);
      font-weight: 600;
    }
  }

  .chip {
    position: absolute;
    background-color: var(--primary-color);
    border-radius: var(--radius-lg);
    transition: all 250ms;
  }
}
</style>

<template>
  <div class="chip-wrapper" :class="{ 'vertical': beVertical }" ref="chipWrapper">
    <div class="chip" ref="chip"></div>
    <div class="option" v-for="(option, index) in options" :class="{ selected: option === currentOption }"
      @click="handleClick(option)" :key="option" :ref="`option-${index}`" tabindex="0"
      @keydown.enter="handleClick(option)">
      <span>{{ option }}</span>
    </div>
  </div>
</template>

<script>
import Button from "./Button.vue";

export default {
  name: "ChipSingle",
  components: { Button },
  data() {
    return {
      currentOption: null,
      beVertical: false,
    };
  },
  props: {
    options: {
      type: Array,
      required: true,
      default: [],
    },
    currentVal: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  emits: ["change"],
  expose: ["setIndex"],
  mounted() {
    this.currentOption = this.options[this.currentVal] || null;
    this.reloadChip();
    window.addEventListener("resize", this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    handleClick(option) {
      if (this.currentOption !== option) {
        this.currentOption = option;
        this.$emit("change", option);
        this.reloadChip();
      }
    },
    setIndex(index) {
      this.currentOption = this.options[index];
      this.$emit("change", this.currentOption);
      this.reloadChip();
    },
    reloadChip() {
      const chip = this.$refs.chip;
      const selectedOption = this.$refs[`option-${this.options.indexOf(this.currentOption)}`][0];
      if (chip && selectedOption) {
        chip.style.width = `${selectedOption.offsetWidth}px`;
        chip.style.height = `${selectedOption.offsetHeight}px`;
        chip.style.transform = `translate(${selectedOption.offsetLeft - chip.offsetLeft}px, ` +
          `${selectedOption.offsetTop - chip.offsetTop}px)`;
      }
    },
    handleResize() {
      const chipWrapper = this.$refs.chipWrapper;
      this.beVertical = (chipWrapper?.offsetWidth || window.innerWidth) < this.options.length * 150;
      this.reloadChip();
    },
  },
};
</script>
