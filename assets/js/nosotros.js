"use strict";
// Route-scoped reveals and counters; shared navigation and theme stay untouched.
window.NosotrosPage = (function () {
  function mount(root) {
    const view = root.querySelector(".about-view");
    if (!view || !("IntersectionObserver" in window)) return function () {};
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const nodes = [...view.querySelectorAll("[data-about-reveal]")];
    const counters = [...view.querySelectorAll("[data-about-count]")];
    const frames = new Map();
    const started = new Set();
    const format = new Intl.NumberFormat("es-ES");
    function finishCounters() {
      frames.forEach(id => cancelAnimationFrame(id));
      frames.clear();
      counters.forEach(counter => {
        counter.textContent = format.format(Number(counter.dataset.aboutCount));
        counter.closest("[data-about-reveal]").style.setProperty("--metric-progress", "1");
        started.add(counter);
      });
    }
    function countWithin(target) {
      target.querySelectorAll("[data-about-count]").forEach(counter => {
        if (reduced.matches || started.has(counter)) return;
        started.add(counter);
        const total = Number(counter.dataset.aboutCount);
        const start = performance.now();
        function tick(time) {
          const progress = Math.min(1, (time - start) / 1400);
          counter.textContent = format.format(Math.round(total * (1 - Math.pow(1 - progress, 3))));
          target.style.setProperty("--metric-progress", String(progress));
          if (progress < 1) frames.set(counter, requestAnimationFrame(tick));
          else frames.delete(counter);
        }
        frames.set(counter, requestAnimationFrame(tick));
      });
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        countWithin(entry.target);
        observer.unobserve(entry.target);
      });
    }, {threshold:0.08, rootMargin:"0px 0px -24px 0px"});
    function applyPreference() {
      if (reduced.matches) {
        observer.disconnect();
        view.classList.remove("about-motion");
        nodes.forEach(node => node.classList.add("is-visible"));
        finishCounters();
      } else {
        view.classList.add("about-motion");
        nodes.filter(node => !node.classList.contains("is-visible")).forEach(node => observer.observe(node));
      }
    }
    reduced.addEventListener("change", applyPreference);
    applyPreference();
    return function cleanup() {
      observer.disconnect();
      frames.forEach(id => cancelAnimationFrame(id));
      frames.clear();
      reduced.removeEventListener("change", applyPreference);
    };
  }
  return {mount};
})();
