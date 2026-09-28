"use strict";
(() => {
  const dialog = document.getElementById('architecture-menu');
  let opener;
  const toggles = () => [...document.querySelectorAll('.nav-toggle')];
  const closeDisclosures = (except) => toggles().forEach(button => {
    if (button === except) return;
    button.setAttribute('aria-expanded','false');
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    if (panel) panel.hidden = true;
  });
  const closeMenu = () => {
    document.body.classList.remove('navigation-open');
    document.querySelectorAll('[data-navigation-open]').forEach(b => b.setAttribute('aria-expanded','false'));
    if (dialog?.open) dialog.close();
  };
  dialog?.addEventListener('cancel', event => { event.preventDefault(); closeMenu(); });
  dialog?.addEventListener('close', () => {
    document.body.classList.remove('navigation-open');
    document.querySelectorAll('[data-navigation-open]').forEach(b => b.setAttribute('aria-expanded','false'));
    closeDisclosures();
    if (opener?.isConnected) opener.focus({preventScroll:true});
  });
  document.addEventListener('click', event => {
    if (event.target.closest('[data-home-link]') && location.hash === '#/') { event.preventDefault(); scrollToTop(); }
    const open = event.target.closest('[data-navigation-open]');
    if (open) {
      opener = open; closeDisclosures(); dialog?.showModal();
      open.setAttribute('aria-expanded','true'); document.body.classList.add('navigation-open'); return;
    }
    const toggle = event.target.closest('.nav-toggle');
    if (toggle) {
      const expanded = toggle.getAttribute('aria-expanded') !== 'true'; closeDisclosures(toggle);
      toggle.setAttribute('aria-expanded', String(expanded));
      const panel = document.getElementById(toggle.getAttribute('aria-controls'));
      if (panel) panel.hidden = !expanded;
      return;
    }
    if (!event.target.closest('.nav-disclosure') || event.target.closest('a')) closeDisclosures();
    if (event.target.closest('[data-navigation-close]') || (dialog?.contains(event.target) && event.target.closest('a'))) closeMenu();
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeMenu();
    }
  });
  document.addEventListener('keydown', event => {
    const disclosure = event.target.closest('.nav-disclosure');
    if (!disclosure) return;
    const button = disclosure.querySelector('.nav-toggle'), panel = disclosure.querySelector('.nav-panel');
    const links = [...panel.querySelectorAll('a:not([aria-disabled="true"])')];
    if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); event.stopPropagation(); closeDisclosures(); button.focus(); }
    if (['ArrowDown','ArrowUp','Home','End'].includes(event.key) && links.length) {
      event.preventDefault(); closeDisclosures(button); button.setAttribute('aria-expanded','true'); panel.hidden = false;
      let i = links.indexOf(document.activeElement);
      i = event.key === 'Home' ? 0 : event.key === 'End' ? links.length-1 : (i + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
      links[i].focus();
    }
  });
  document.addEventListener('focusin', event => { if (!event.target.closest('.nav-disclosure')) closeDisclosures(); });
  window.addEventListener('hashchange', () => { closeMenu(); closeDisclosures(); updateActive(); });
  matchMedia('(min-width:1100px)').addEventListener('change', () => { closeMenu(); closeDisclosures(); });
  function updateActive() {
    document.querySelectorAll('[data-home-link]').forEach(a => {
      if (!location.hash || location.hash === '#/') a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    const route = location.hash.split('#')[1];
    document.querySelectorAll('.nav-toggle').forEach(button => {
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      const active = panel && [...panel.querySelectorAll('a[href^="#/"]')].some(a => {
        const href = a.getAttribute('href') || '';
        const match = href.match(/^#\/[^#]+/);
        return !!match && match[0] === '#' + route;
      });
      button.classList.toggle('is-current', !!active);
    });
    dialog?.querySelectorAll('a[data-r]').forEach(a => { if ((a.dataset.r === 'home' ? '/' : '/'+a.dataset.r) === route) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
  }
  updateActive();
})();
