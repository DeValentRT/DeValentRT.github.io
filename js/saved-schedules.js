// Pestaña "Horarios guardados": lista de hasta 5 combinaciones que el
// usuario marcó con la estrella — desde el generador o desde la
// tarjeta "Activo ahora" de "Mis cursos" (armando el horario a mano).
// toggleSaveCombination es compartida por ambos orígenes para no
// duplicar la lógica de guardar/quitar/avisar cuando está lleno.

window.App = window.App || {};

(function (App) {
  const { escapeHTML, qsa } = App.utils;

  const savedSchedulesList = document.getElementById('savedSchedulesList');
  const savedSchedulesEmpty = document.getElementById('savedSchedulesEmpty');
  const savedSchedulesCount = document.getElementById('savedSchedulesCount');

  function isCombinationSaved(combination) {
    return App.state.findSavedScheduleIndex(combination) !== -1;
  }

  function toggleSaveCombination(combination, starBtn) {
    if (!combination || combination.length === 0) {
      alert('No hay ningún curso activo para guardar.');
      return;
    }

    const existingIndex = App.state.findSavedScheduleIndex(combination);

    if (existingIndex !== -1) {
      App.state.removeSavedSchedule(App.state.savedSchedules[existingIndex].id);
      if (starBtn) {
        starBtn.classList.remove('saved');
        starBtn.title = 'Guardar este horario';
      }
    } else {
      const result = App.state.addSavedSchedule(combination);
      if (!result.ok && result.reason === 'full') {
        alert(`Tu almacén de horarios guardados está lleno (máximo ${App.state.MAX_SAVED_SCHEDULES}). Elimina alguno en "Guardados" para guardar uno nuevo.`);
        return;
      }
      if (starBtn) {
        starBtn.classList.add('saved');
        starBtn.title = 'Ya guardado — toca para quitarlo';
      }
    }

    renderSavedSchedules();
    if (App.generator) App.generator.renderGeneratorUI();
  }

  function renderSavedSchedules() {
    const { savedSchedules, courses } = App.state;

    savedSchedulesCount.textContent = savedSchedules.length;

    if (savedSchedules.length === 0) {
      savedSchedulesList.innerHTML = '';
      savedSchedulesEmpty.style.display = 'block';
      return;
    }

    savedSchedulesEmpty.style.display = 'none';

    savedSchedulesList.innerHTML = savedSchedules.map((saved, index) => {
      const itemsHTML = saved.combination.map(option => {
        const course = courses.find(c => c.id === option.courseId);
        const name = course ? course.name : '(curso eliminado)';
        const color = course ? course.color : '#9a9da6';
        const code = option.labGroup ? `${option.theoryGroup}/${option.labGroup}` : option.theoryGroup;

        return `
          <div class="active-now-item">
            <span class="active-now-dot" style="background:${color}"></span>
            <span class="active-now-name">${escapeHTML(name)}</span>
            <span class="active-now-code">${code}</span>
          </div>
        `;
      }).join('');

      return `
        <div class="saved-schedule-card">
          <div class="saved-schedule-header">
            <div class="saved-schedule-title">Horario ${index + 1}</div>
            <button type="button" class="saved-schedule-delete" data-id="${saved.id}" title="Eliminar">×</button>
          </div>
          <div class="saved-schedule-items">${itemsHTML}</div>
          <button type="button" class="btn-generator-search saved-schedule-apply" data-id="${saved.id}">
            Aplicar este horario
          </button>
        </div>
      `;
    }).join('');

    qsa('.saved-schedule-apply', savedSchedulesList).forEach(btn => {
      btn.addEventListener('click', () => {
        const saved = App.state.savedSchedules.find(s => s.id === btn.dataset.id);
        if (saved) App.generator.applyCombination(saved.combination);
      });
    });

    // Doble confirmación: hace falta tocar el botón Y confirmar el
    // diálogo para que se borre, así no se pierde un horario por error.
    qsa('.saved-schedule-delete', savedSchedulesList).forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('¿Eliminar este horario guardado? Esta acción no se puede deshacer.')) {
          App.state.removeSavedSchedule(btn.dataset.id);
          renderSavedSchedules();
          if (App.generator) App.generator.renderGeneratorUI();
        }
      });
    });
  }

  App.savedSchedules = { renderSavedSchedules, toggleSaveCombination, isCombinationSaved };
})(window.App);
