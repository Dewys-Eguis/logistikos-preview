"use strict";
// Route-scoped reveals and counters; shared navigation and theme stay untouched.
window.NosotrosPage = (function () {
  function mount(root) {
    const view = root.querySelector(".about-view");
    if (!view || !("IntersectionObserver" in window)) return function () {};
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const nodes = [...view.querySelectorAll("[data-about-reveal]")];
    const stopCounters = MetricCounters.mount(view);
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");

        observer.unobserve(entry.target);
      });
    }, {threshold:0.08, rootMargin:"0px 0px -24px 0px"});
    function applyPreference() {
      if (reduced.matches) {
        observer.disconnect();
        view.classList.remove("about-motion");
        nodes.forEach(node => node.classList.add("is-visible"));

      } else {
        view.classList.add("about-motion");
        nodes.filter(node => !node.classList.contains("is-visible")).forEach(node => observer.observe(node));
      }
    }
    reduced.addEventListener("change", applyPreference);
    applyPreference();
    return function cleanup() {
      observer.disconnect();
      stopCounters();
      reduced.removeEventListener("change", applyPreference);
    };
  }
  return {mount};
})();
