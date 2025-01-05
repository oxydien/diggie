<style lang="scss">
.carousel-wrapper {
  position: relative;
  width: 100%;
  height: 100%;

  .carousel-items {
    position: relative;
    display: flex;
    flex-flow: row nowrap;
    overflow: hidden;

    min-height: max(100px, var(--_item-height));
    transition: all 250ms;

    &>* {
      position: absolute;
      min-width: var(--_item-width);
      width: var(--_item-width);
      max-width: var(--_item-width);

      transition: all 250ms;
    }
  }
}
</style>

<template>
  <div class="carousel-wrapper" ref="carouselWrapper">
    <div class="carousel-items" :style="{ '--_item-width': `${targetWidth}px`, '--_item-height': `${targetHeight}px` }"
      ref="carouselItems">
      <slot>
      </slot>
    </div>
  </div>
</template>

<script>
import { setTabIndexRecursively } from "../../utils/element.js";

export default {
  name: "Carousel",
  data() {
    return {
      currentIndex: 0,
      targetHeight: 100,
      targetWidth: 100,
    };
  },
  mounted() {
    this.currentIndex = this.index || 0;
    this.targetWidth = this.$refs.carouselWrapper.offsetWidth;
    this.moveItems();

    window.addEventListener("resize", this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    moveItems() {
      const items = this.$refs.carouselItems?.children;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        item.style.transform = `translateX(${(i - this.currentIndex) * -100}%)`;
        if (i === this.currentIndex) {
          setTabIndexRecursively(item, 0);
          this.targetHeight = item.offsetHeight;
        } else {
          setTabIndexRecursively(item, -1);
        }
      }
    },
    setIndex(index) {
      this.currentIndex = index;
      this.moveItems();
    },
    handleResize() {
      this.targetWidth = this.$refs.carouselWrapper.offsetWidth;
      this.moveItems();
    }
  },
};
</script>