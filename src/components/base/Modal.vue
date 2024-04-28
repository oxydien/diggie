<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  width: 100dvw;
  height: 100dvh;
  transition: opacity var(--_anim-duration);
  opacity: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: grid;
  place-items: center;
  z-index: 1000;

  &.is-open {
    opacity: 1;

    .modal-wrapper {
      transform: translateY(0);
    }
  }
  &.blurry {
    backdrop-filter: blur(5px);
  }

  .modal-wrapper {
    position: relative;
    min-width: 200px;
    max-height: min(100dvh, 600px);
    height: fit-content;
    display: grid;
    grid-template-rows: 30px auto;
    overflow: auto;
    gap: var(--gap-sm);

    transition: transform var(--_anim-duration);
    background-color: var(--foreground-color);
    padding: var(--gap-md);
    border-radius: var(--radius-md);
    box-shadow: 2px 2px 5px 0 black;
    transform: translateY(80dvh);

    .modal-header {
      position: sticky;
      top: calc(var(--gap-sm) * -1);
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--gap-sm);
      padding-top: var(--gap-sm);
      font-size: 1.2rem;
      background-color: var(--foreground-color);
    }

    .modal-content {
      min-height: 0;
      overflow: auto;
    }
  }
}
</style>

<template>
  <div
    v-if="isConsideredOpen"
    class="modal-overlay"
    :class="{ 'is-open': isAnimationOpen, blurry: blurry }"
    :style="`--_anim-duration: ${animDuration}ms`"
    @click="tryCloseModal"
  >
    <div class="modal-wrapper" @click.stop ref="modalWrapper">
      <div class="modal-header">
        <h3>{{ header }}</h3>
        <Button iconOnly @click="tryCloseModal" v-if="closable"
          ><CloseIcon
        /></Button>
      </div>
      <div class="modal-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import CloseIcon from "../icons/CloseIcon.vue";
import Button from "./Button.vue";
export default {
  components: { CloseIcon, Button },
  data() {
    return {
      animDuration: 200,
      isConsideredOpen: false,
      isAnimationOpen: false,
      animTimeout: null,
    };
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    header: {
      type: String,
      required: true,
      default: "Modal window",
    },
    closable: {
      type: Boolean,
      default: true,
    },
    blurry: {
      type: Boolean,
      default: true,
    },
  },
  watch: {
    isOpen() {
      if (this.isOpen) {
        clearTimeout(this.animTimeout);
        this.isConsideredOpen = true;
        setTimeout(() => {
          this.setFocusToFirstElement();
          this.addFocusTrap();
          this.isAnimationOpen = true;
        }, 10);
      } else {
        this.isAnimationOpen = false;
        this.removeFocusTrap();
        this.animTimeout = setTimeout(() => {
          this.isConsideredOpen = false;
        }, this.animDuration);
      }
    },
  },
  methods: {
    tryCloseModal() {
      if (this.closable) {
        this.closeModal();
      }
    },
    closeModal() {
      this.$emit("close");
    },
    setFocusToFirstElement() {
      const focusableElements = this.$refs.modalWrapper.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    },
    addFocusTrap() {
      document.addEventListener("keydown", this.trapFocus);
    },
    removeFocusTrap() {
      document.removeEventListener("keydown", this.trapFocus);
    },
    trapFocus(event) {
      if (event.key !== "Tab") return;
      if (!this.$refs.modalWrapper) return;

      const focusableElements = this.$refs.modalWrapper.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    },
  },
};
</script>
