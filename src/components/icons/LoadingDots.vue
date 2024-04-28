<style lang="scss" scoped>
.loading-dots {
  .loading-dots-first,
  .loading-dots-second,
  .loading-dots-third {
    animation: loadingDots 1s linear forwards infinite;
  }
  .loading-dots-second {
    animation-delay: 200ms;
  }
  .loading-dots-third {
    animation-delay: 400ms;
  }
}

@keyframes loadingDots {
  0% {
    fill: var(--text-color-muted);
  }
  50% {
    fill: var(--text-color-highlighted);
  }
  100% {
    fill: var(--text-color-muted);
  }
}
</style>

<template>
  <svg
    width="50"
    height="22"
    viewBox="0 0 50 22"
    fill="none"
    class="loading-dots"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 11C7 8.79086 8.79086 7 11 7C13.2091 7 15 8.79086 15 11C15 13.2091 13.2091 15 11 15C8.79086 15 7 13.2091 7 11Z"
      fill="#D9D9D9"
      class="loading-dots-first"
    />
    <path
      d="M21 11C21 8.79086 22.7909 7 25 7C27.2091 7 29 8.79086 29 11C29 13.2091 27.2091 15 25 15C22.7909 15 21 13.2091 21 11Z"
      fill="#D9D9D9"
      class="loading-dots-second"
    />
    <path
      d="M35 11C35 8.79086 36.7909 7 39 7C41.2091 7 43 8.79086 43 11C43 13.2091 41.2091 15 39 15C36.7909 15 35 13.2091 35 11Z"
      fill="#D9D9D9"
      class="loading-dots-third"
    />
  </svg>
</template>
