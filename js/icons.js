// Set de iconos SVG en línea (sin depender de ningún servicio externo,
// así la página sigue funcionando sin internet). Todos usan
// stroke="currentColor", así que heredan el color de texto de su
// contenedor y se adaptan solos al modo oscuro.

window.App = window.App || {};

(function (App) {
  const ATTR = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

  const ICONS = {
    calendar: `<svg class="icon" ${ATTR}><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="16" y1="3" x2="16" y2="7"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,

    book: `<svg class="icon" ${ATTR}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,

    shuffle: `<svg class="icon" ${ATTR}><path d="M3 6h3.5c2 0 3 1.2 4 2.7"/><path d="M3 18h3.5c2 0 3-1.2 4-2.7"/><path d="M13 8.5C14.2 6.7 15.3 6 17.5 6H21"/><path d="M13 15.5c1.2 1.8 2.3 2.5 4.5 2.5H21"/><polyline points="18 3 21 6 18 9"/><polyline points="18 15 21 18 18 21"/></svg>`,

    bookmark: `<svg class="icon" ${ATTR}><path d="M6 3h12v18l-6-4.2L6 21V3z"/></svg>`,

    moon: `<svg class="icon" ${ATTR}><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.7 6.7 0 0 0 10.5 10.5z"/></svg>`,

    sun: `<svg class="icon" ${ATTR}><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4" y1="12" x2="2" y2="12"/><line x1="22" y1="12" x2="20" y2="12"/><line x1="4.9" y1="4.9" x2="3.5" y2="3.5"/><line x1="20.5" y1="20.5" x2="19.1" y2="19.1"/><line x1="4.9" y1="19.1" x2="3.5" y2="20.5"/><line x1="20.5" y1="3.5" x2="19.1" y2="4.9"/></svg>`,

    clock: `<svg class="icon" ${ATTR}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/></svg>`,

    'alert-triangle': `<svg class="icon" ${ATTR}><path d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,

    coffee: `<svg class="icon" ${ATTR}><path d="M18 8h1a3 3 0 0 1 0 6h-1"/><path d="M2 8h16v6a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>`,

    eye: `<svg class="icon" ${ATTR}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>`,

    'eye-off': `<svg class="icon" ${ATTR}><path d="M17.9 17.9A11 11 0 0 1 12 19c-7 0-11-7-11-7a19.7 19.7 0 0 1 4.2-5.2"/><path d="M9.9 4.2A9.9 9.9 0 0 1 12 4c7 0 11 7 11 7a19.6 19.6 0 0 1-2.3 3.3"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,

    plus: `<svg class="icon" ${ATTR}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,

    minus: `<svg class="icon" ${ATTR}><line x1="5" y1="12" x2="19" y2="12"/></svg>`
  };

  function icon(name) {
    return ICONS[name] || '';
  }

  App.icons = { icon };
})(window.App);
