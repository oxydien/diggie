export default {
  mounted(el) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const index in entries) {
          const entry = entries[index];

          if (entry.isIntersecting) {
            if (entry.target.tagName === "VIDEO") {
              entry.target.play();
              entry.target.volume = 0;
            }
          } else {
            if (entry.target.tagName === "VIDEO") {
              entry.target.pause();
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
