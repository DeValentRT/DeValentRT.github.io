// Controla la barra inferior y el panel deslizable: qué sección se
// muestra (cursos / generador / guardados) y su apertura/cierre.
// No depende de App.state ni de la lógica de cursos: solo cambia qué
// bloque de HTML queda visible dentro del panel ya existente, así que
// App.sidebar y App.generator siguen renderizando exactamente igual
// que antes dentro de esos bloques.

window.App = window.App || {};

(function (App) {
  const panelOverlay = document.getElementById('panelOverlay');
  const panelTitle = document.getElementById('panelTitle');
  const panelClose = document.getElementById('panelClose');
  const navButtons = [...document.querySelectorAll('.nav-btn[data-panel]')];
  const panelSections = [...document.querySelectorAll('.panel-section')];

  const PANEL_TITLES = {
    courses: 'Mis cursos',
    generator: 'Generar horarios',
    saved: 'Horarios guardados'
  };

  let activePanel = null;

  function openPanel(key) {
    panelSections.forEach(section => {
      section.classList.toggle('active', section.dataset.panel === key);
    });
    navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.panel === key);
    });

    panelTitle.textContent = PANEL_TITLES[key] || '';
    panelOverlay.classList.add('open');
    activePanel = key;
  }

  function closePanel() {
    panelOverlay.classList.remove('open');
    navButtons.forEach(btn => btn.classList.remove('active'));
    activePanel = null;
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.panel;
      if (activePanel === key) {
        closePanel();
      } else {
        openPanel(key);
      }
    });
  });

  panelClose.addEventListener('click', closePanel);

  App.panels = { openPanel, closePanel };
})(window.App);
