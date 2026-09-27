"use strict";
window.FormacionPage = (function () {
  function mount(root) {
    if (!root || !root.querySelector(".formation-view")) return function () {};
    const view = root.querySelector(".formation-view");
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return function () {};
    view.classList.add("motion-ready");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    view.querySelectorAll("[data-formation-reveal]").forEach((node) => observer.observe(node));
    return function cleanup() { observer.disconnect(); };
  }
  return { mount };
})();
