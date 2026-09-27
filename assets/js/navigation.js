"use strict";
(() => {
  const dialog = document.getElementById('architecture-menu');
  let opener;
  const closeResources = (except) => document.querySelectorAll('.resource-toggle').forEach(button => {
    if (button === except) return;
    button.setAttribute('aria-expanded','false');
    document.getElementById(button.getAttribute('aria-controls')).hidden = true;
  });
  const closeMenu = () => {
    document.body.classList.remove('navigation-open');
    document.querySelectorAll('[data-navigation-open]').forEach(b => b.setAttribute('aria-expanded','false'));
    if (dialog.open) dialog.close();
  };
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeMenu(); });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('navigation-open');
    document.querySelectorAll('[data-navigation-open]').forEach(b => b.setAttribute('aria-expanded','false'));
    closeResources();
    if (opener?.isConnected) opener.focus({preventScroll:true});
  });
  document.addEventListener('click', event => {
    const open = event.target.closest('[data-navigation-open]');
    if (open) {
      opener = open; closeResources(); dialog.showModal();
      open.setAttribute('aria-expanded','true'); document.body.classList.add('navigation-open'); return;
    }
    const toggle = event.target.closest('.resource-toggle');
    if (toggle) {
      const expanded = toggle.getAttribute('aria-expanded') !== 'true'; closeResources(toggle);
      toggle.setAttribute('aria-expanded', String(expanded));
      document.getElementById(toggle.getAttribute('aria-controls')).hidden = !expanded; return;
    }
    if (!event.target.closest('.resource-nav') || event.target.closest('a')) closeResources();
    if (event.target.closest('[data-navigation-close]') || (dialog.contains(event.target) && event.target.closest('a'))) closeMenu();
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeMenu();
    }
  });
  document.addEventListener('keydown', event => {
    const resource = event.target.closest('.resource-nav');
    if (!resource) return;
    const button = resource.querySelector('button'), panel = resource.querySelector('.resource-panel');
    const links = [...panel.querySelectorAll('a')];
    if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); event.stopPropagation(); closeResources(); button.focus(); }
    if (['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
      event.preventDefault(); closeResources(button); button.setAttribute('aria-expanded','true'); panel.hidden = false;
      let i = links.indexOf(document.activeElement);
      i = event.key === 'Home' ? 0 : event.key === 'End' ? links.length-1 : (i + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
      links[i].focus();
    }
  });
  document.addEventListener('focusin', event => { if (!event.target.closest('.resource-nav')) closeResources(); });
  window.addEventListener('hashchange', () => { closeMenu(); closeResources(); updateActive(); });
  matchMedia('(min-width:1100px)').addEventListener('change', () => { closeMenu(); closeResources(); });
  function updateActive() {
    const route = location.hash.split('#')[1];
    document.querySelectorAll('.resource-toggle').forEach(b => b.classList.toggle('is-current', ['/fundae','/rrhh','/universitarios'].includes(route)));
    dialog.querySelectorAll('a[data-r]').forEach(a => { if ('/'+a.dataset.r === route) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
  }
  updateActive();
})();
