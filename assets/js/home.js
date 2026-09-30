"use strict";

// The Home is a view over the existing catalog and calculator, not a second data model.
function getHomeValues(courses) {
  const selections = [
    ["alm", 0, "Supply Chain", "supply-chain"],
    ["com", 0, "Compras", "compras"],
    ["tra", 0, "Transporte", "transporte"],
    ["dir", 1, "IA y Datos", "ia-datos"],
    ["dir", 0, "Liderazgo", "liderazgo"],
    ["cex", 0, "Comercio exterior", "comercio-internacional"],
  ];
  return {
    homePrograms: selections.map(([department, index, area, slug], i) => ({
      ...courses.data.find((item) => item.id === department).courses[index],
      area, slug, route: "#/area/" + slug, number: String(i + 1).padStart(2, "0"),
    })),
    roadmapOptions: courses.hrData,
  };
}

const HomePage = {
  mount(root, component) {
    const controller = new AbortController();
    const on = (target, event, callback, options = {}) => target.addEventListener(event, callback, { ...options, signal: controller.signal });
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    function selectTab(tab, moveFocus = false) {
      tabs.forEach((item) => {
        const active = item === tab;
        item.setAttribute("aria-selected", String(active));
        item.tabIndex = active ? 0 : -1;
        root.querySelector("#" + item.getAttribute("aria-controls")).hidden = !active;
      });
      if (moveFocus) tab.focus();
    }
    tabs.forEach((tab, index) => {
      on(tab, "click", () => selectTab(tab));
      on(tab, "keydown", (event) => {
        let next;
        if (["ArrowDown", "ArrowRight"].includes(event.key)) next = (index + 1) % tabs.length;
        if (["ArrowUp", "ArrowLeft"].includes(event.key)) next = (index + tabs.length - 1) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next !== undefined) { event.preventDefault(); selectTab(tabs[next], true); }
      });
    });

    const programButtons = [...root.querySelectorAll("[data-course-filter]")];
    const programCards = [...root.querySelectorAll("[data-course-area]")];
    programButtons.forEach((button) => on(button, "click", () => {
      const filter = button.dataset.courseFilter;
      programButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      let count = 0;
      programCards.forEach((card) => {
        card.hidden = filter !== "all" && filter !== card.dataset.courseArea;
        if (!card.hidden) count++;
      });
      root.querySelector("#course-status").textContent = `${count} ${count === 1 ? "programa disponible" : "programas disponibles"}`;
    }));

    const roadmapButtons = [...root.querySelectorAll("[data-roadmap]")];
    function updateRoadmap(id) {
      component.state.hr = id;
      const { hr } = getCourseValues.call(component);
      roadmapButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.roadmap === id)));
      root.querySelectorAll("[data-roadmap-value]").forEach((node) => { node.textContent = node.dataset.roadmapValue === "hours" ? hr.hours.replace(/(\d+ h)/, "$1 recomendadas") : hr[node.dataset.roadmapValue]; });
      const link = root.querySelector("[data-roadmap-link]");
      const blocked = [...root.querySelectorAll(".area-card[data-pending-href]")].some(card => card.dataset.pendingHref === hr.route);
      link.classList.toggle("is-pending-link", blocked);
      if (blocked) {
        link.removeAttribute("href");
        link.dataset.pendingHref = hr.route;
        link.setAttribute("aria-disabled", "true");
        link.setAttribute("title", "Próximamente");
      } else {
        link.href = hr.route;
        delete link.dataset.pendingHref;
        link.removeAttribute("aria-disabled");
        link.removeAttribute("title");
      }
    }
    roadmapButtons.forEach((button) => on(button, "click", () => updateRoadmap(button.dataset.roadmap)));
    updateRoadmap(component.state.hr);

    root.querySelectorAll(".partner-track").forEach((track) => {
      const copy = track.firstElementChild.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      copy.querySelectorAll("img").forEach((image) => { image.alt = ""; });
      track.appendChild(copy);
    });
    const pause = root.querySelector("[data-marquee-pause]");
    if (pause) {
      on(pause, "click", () => {
        const paused = root.querySelector(".home-partners").classList.toggle("is-paused");
        pause.setAttribute("aria-pressed", String(paused));
        pause.textContent = paused ? "Reanudar movimiento" : "Pausar movimiento";
      });
    }

    const stopMotion = HomeMotion.mount(root);
    return () => { controller.abort(); stopMotion(); };
  },
};
