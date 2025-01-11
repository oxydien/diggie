export default {
  mounted(el: HTMLElement) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const index in entries) {
          const entry = entries[index];

          const target = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            // When 'gif' is shown, play it
            if (target.tagName === "VIDEO" && target.classList.contains("embed-gif-container")) {
              const target = entry.target as HTMLVideoElement;
              target.play();
              target.volume = 0;
            }
          } else {
            const target = entry.target as HTMLElement;
            if (target.tagName === "VIDEO") {
              const target = entry.target as HTMLVideoElement;
              target.pause();
            }
          }
        }
      },
      {
        threshold: 0.3,
      }
    );

    observer.observe(el);
  },
};
