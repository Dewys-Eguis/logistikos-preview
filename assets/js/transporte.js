"use strict";
window.TransportePage = {
  mount(root) {
    const view = root.querySelector('.tr-page');
    if (!view) return () => {};
    const controls = new AbortController();
    const buttons = [...view.querySelectorAll('[data-transport-filter]')];
    const programs = [...view.querySelectorAll('[data-transport-category]')];
    view.querySelector('[data-transport-tools]').hidden = false;
    buttons.forEach(button => button.addEventListener('click', () => {
      const category = button.dataset.transportFilter;
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      programs.forEach(item => {
        item.hidden = category !== 'all' && item.dataset.transportCategory !== category;
      });
      view.querySelector('[data-transport-count]').textContent = `${programs.filter(item => !item.hidden).length} programas`;
    }, {signal:controls.signal}));
    return () => controls.abort();
  }
};
