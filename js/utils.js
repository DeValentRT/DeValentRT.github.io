// Helpers de DOM y formato, sin dependencias de otros módulos.
// Se cuelgan de window.App.utils para que el resto de scripts los usen.

window.App = window.App || {};

(function (App) {
  const qs = (sel, el = document) => el.querySelector(sel);
  const qsa = (sel, el = document) => [...el.querySelectorAll(sel)];

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, s => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s]));
  }

  function toMinutes(hhmm) {
    if (!hhmm) return 0;
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  }

  function formatTimeRange(start, end) {
    return `${start} - ${end}`;
  }

  function getGroupKey(courseId, groupType, groupCode, isLab = false) {
    return `${courseId}_${isLab ? 'lab_' : ''}${groupCode}`;
  }

  // Convierte un color hex (el que elige el usuario para su curso) a
  // rgba con la opacidad indicada — así el fondo tenue de los bloques
  // de curso funciona con cualquier color, sin importar cuál elijan.
  function hexToRgba(hex, alpha) {
    const clean = hex.replace('#', '');
    const full = clean.length === 3
      ? clean.split('').map(c => c + c).join('')
      : clean;
    const bigint = parseInt(full, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Bloqueo de scroll del body compartido entre el modal y el panel
  // deslizable: mientras alguno está abierto, el fondo (la grilla)
  // no debe scrollear con el dedo. Lleva un contador por si ambos
  // llegaran a estar "abiertos" a la vez, para no desbloquear de más.
  let scrollLockCount = 0;
  let savedScrollY = 0;

  function lockBodyScroll() {
    if (scrollLockCount === 0) {
      savedScrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${savedScrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.classList.add('no-scroll');
    }
    scrollLockCount++;
  }

  function unlockBodyScroll() {
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0) {
      document.body.classList.remove('no-scroll');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      window.scrollTo(0, savedScrollY);
    }
  }

  App.utils = {
    qs, qsa, generateId, escapeHTML, toMinutes, formatTimeRange, getGroupKey, hexToRgba,
    lockBodyScroll, unlockBodyScroll
  };
})(window.App);
