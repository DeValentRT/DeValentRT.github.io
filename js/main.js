// Punto de entrada. Para cuando este script se ejecuta, todos los
// demás (utils, state, conflicts, schedule-render, modal-form,
// sidebar, generator) ya se cargaron como <script> normales en
// index.html, en ese orden, así que App.* ya está completo.

window.App = window.App || {};

(function (App) {
  function init() {
    App.sidebar.renderSidebar();
    App.scheduleRender.renderCourses();
    App.generator.initScheduleGenerator();
  }

  document.addEventListener('DOMContentLoaded', init);
})(window.App);
