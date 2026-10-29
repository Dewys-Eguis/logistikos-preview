/* Logistikos · Portada de impacto — lógica sin dependencias.
   Uso: <script src="logistikos-hero.js" defer></script>  (o initLogistikosHero(elemento) en una SPA) */
(function () {
  var CATS = ['Supply Chain y Logística', 'Compras y Category Management', 'Transporte y Distribución', 'Comercio Internacional', 'Liderazgo y Bienestar de Equipos', 'IA, Datos y Digitalización', 'Cursos universitarios', 'Formaciones obligatorias'];

  function wrapLines(text, width) {
    var lines = [''];
    text.toUpperCase().split(' ').forEach(function (w) {
      var cur = lines[lines.length - 1];
      var next = cur ? cur + ' ' + w : w;
      if (next.length <= width) lines[lines.length - 1] = next; else lines.push(w);
    });
    while (lines.length < 3) lines.push('');
    return lines.slice(0, 3);
  }

  function madridTime(withSeconds) {
    try {
      var o = { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', hour12: false };
      if (withSeconds) o.second = '2-digit';
      return new Intl.DateTimeFormat('es-ES', o).format(new Date());
    } catch (e) { return '--:--'; }
  }

  function init(root) {
    if (!root || root.__lgk) return function () {};
    root.__lgk = true;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var flaps = root.querySelector('[data-lgk-flaps]');
    var idx = root.querySelector('[data-lgk-idx]');
    var bar = root.querySelector('[data-lgk-bar]');
    var clock = root.querySelector('[data-lgk-clock]');
    var cells = Array.prototype.slice.call(root.querySelectorAll('[data-lgk-cell]'));
    var fill = root.querySelector('[data-lgk-rail-fill]');
    var t = 0, cat = -1;

    function renderFlaps(ci) {
      if (!flaps) return;
      var width = window.innerWidth <= 760 ? 13 : 16;
      var lines = wrapLines(CATS[ci], width);
      flaps.innerHTML = '';
      lines.forEach(function (ln, r) {
        var row = document.createElement('div');
        row.className = 'lgk-row';
        var s = (ln + ' '.repeat(width)).slice(0, width);
        for (var i = 0; i < width; i++) {
          var c = document.createElement('span');
          c.className = 'lgk-flap';
          c.textContent = s[i] === ' ' ? ' ' : s[i];
          c.style.animationDelay = (r * 0.08 + i * 0.03).toFixed(2) + 's';
          row.appendChild(c);
        }
        flaps.appendChild(row);
      });
      flaps.setAttribute('aria-label', 'Formación: ' + CATS[ci]);
      if (idx) idx.textContent = '0' + (ci + 1);
      if (bar) bar.style.width = ((ci + 1) / 8 * 100) + '%';
    }

    function renderRail(ai) {
      cells.forEach(function (c, i) {
        c.classList.toggle('is-on', i === ai);
        c.classList.toggle('is-done', i < ai);
      });
      if (fill) fill.style.width = (ai * 150) + 'px';
    }

    function tick() {
      var ci = Math.floor(t / 3) % 8;
      if (ci !== cat) { cat = ci; renderFlaps(ci); }
      renderRail(Math.floor(t / 2) % 4);
      if (clock) clock.textContent = 'ES ' + madridTime(window.innerWidth > 760);
      t++;
    }

    tick();
    var iv = reduce ? null : setInterval(tick, 1000);
    if (reduce && clock) setInterval(function () { clock.textContent = 'ES ' + madridTime(false); }, 30000);
    var onResize = function () { renderFlaps(cat < 0 ? 0 : cat); };
    window.addEventListener('resize', onResize);
    return function destroy() { clearInterval(iv); window.removeEventListener('resize', onResize); root.__lgk = false; };
  }

  window.initLogistikosHero = init;
  function auto() { document.querySelectorAll('.lgk-hero').forEach(function (el) { init(el); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto); else auto();
})();
