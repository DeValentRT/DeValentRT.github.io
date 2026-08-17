// Controla la barra inferior y el panel deslizable: qué sección se
// muestra (cursos / generador / guardados), su apertura/cierre,
// el bloqueo de scroll del fondo mientras está abierto, y el gesto
// de arrastrar hacia abajo para cerrarlo (como un bottom sheet).
//
// No depende de App.state ni de la lógica de cursos: solo cambia qué
// bloque de HTML queda visible dentro del panel ya existente, así que
// App.sidebar y App.generator siguen renderizando exactamente igual
// que antes dentro de esos bloques.

window.App = window.App || {};

(function (App) {
  const panelOverlay = document.getElementById('panelOverlay');
  const panelHandle = document.getElementById('panelHandle');
  const panelHeader = document.querySelector('.panel-header');
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

  function showPanelContent(key) {
    panelSections.forEach(section => {
      section.classList.toggle('active', section.dataset.panel === key);
    });
    navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.panel === key);
    });
    panelTitle.textContent = PANEL_TITLES[key] || '';
  }

  function openPanel(key) {
    showPanelContent(key);
    panelOverlay.classList.add('open');
    App.utils.lockBodyScroll();
    activePanel = key;
  }

  function closePanel() {
    panelOverlay.classList.remove('open');
    navButtons.forEach(btn => btn.classList.remove('active'));
    if (activePanel !== null) {
      App.utils.unlockBodyScroll();
    }
    activePanel = null;
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.panel;
      if (activePanel === key) {
        closePanel();
      } else if (activePanel === null) {
        openPanel(key);
      } else {
        // Ya hay un panel abierto: solo cambia el contenido, sin
        // volver a bloquear/desbloquear el scroll del fondo.
        showPanelContent(key);
        activePanel = key;
      }
    });
  });

  panelClose.addEventListener('click', closePanel);

  // --- Arrastrar hacia abajo para cerrar (desde la manija o el header) ---

  let dragStartY = null;
  let dragDelta = 0;
  let isDragging = false;
  const DRAG_CLOSE_THRESHOLD = 90;

  function onDragStart(e) {
    if (e.target.closest('.panel-close')) return;
    dragStartY = e.touches[0].clientY;
    isDragging = true;
    panelOverlay.style.transition = 'none';
  }

  function onDragMove(e) {
    if (!isDragging || dragStartY === null) return;
    const currentY = e.touches[0].clientY;
    const delta = currentY - dragStartY;

    if (delta > 0) {
      dragDelta = delta;
      panelOverlay.style.transform = `translateY(${delta}px)`;
      e.preventDefault();
    }
  }

  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    panelOverlay.style.transition = '';
    panelOverlay.style.transform = '';

    const shouldClose = dragDelta > DRAG_CLOSE_THRESHOLD;
    dragStartY = null;
    dragDelta = 0;

    if (shouldClose) {
      closePanel();
    }
  }

  [panelHandle, panelHeader].forEach(el => {
    if (!el) return;
    el.addEventListener('touchstart', onDragStart, { passive: true });
    el.addEventListener('touchmove', onDragMove, { passive: false });
    el.addEventListener('touchend', onDragEnd);
    el.addEventListener('touchcancel', onDragEnd);
  });

  App.panels = { openPanel, closePanel };
})(window.App);
