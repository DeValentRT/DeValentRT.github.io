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

  App.utils = { qs, qsa, generateId, escapeHTML, toMinutes, formatTimeRange, getGroupKey };
})(window.App);
