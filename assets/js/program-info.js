"use strict";
// Shared, delegated controls also work after route and department re-renders.
(() => {
  let opener;
  const dialogs = [...document.querySelectorAll('.program-info-dialog')];
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-program-info]');
    if (!trigger) return;
    const dialog = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!dialog) return;
    event.preventDefault(); // A control inside a summary must not toggle the card.
    opener = trigger;
    dialog.showModal();
  });
  dialogs.forEach(dialog => {
    dialog.addEventListener('click', event => {
      if (event.target.closest('[data-program-info-close]')) dialog.close();
      if (event.target === dialog) {
        const r = dialog.getBoundingClientRect();
        if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
      }
    });
    // Native dialog handles Escape, focus containment and inert background.
    dialog.addEventListener('close', () => {
      if (opener?.isConnected) opener.focus({preventScroll:true});
    });
  });
  window.addEventListener('hashchange', () => dialogs.forEach(d => { if (d.open) d.close(); }));
})();
