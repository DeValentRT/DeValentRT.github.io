// Estadísticas del panel "Mis cursos": cursos visibles, horas totales,
// huecos entre clases y cruces de horario — todo calculado en función
// de lo que está VISIBLE en la grilla en este momento, no de todo lo
// que hay cargado. Reutiliza App.conflicts.checkForConflicts() para el
// conteo de cruces en vez de recalcularlo por su cuenta.

window.App = window.App || {};

(function (App) {
  const { toMinutes, escapeHTML } = App.utils;

  const statCoursesValue = document.getElementById('statCoursesValue');
  const statHoursValue = document.getElementById('statHoursValue');
  const statGapsValue = document.getElementById('statGapsValue');
  const statConflictsValue = document.getElementById('statConflictsValue');
  const statChipConflicts = document.getElementById('statChipConflicts');

  const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  function formatHours(totalMinutes) {
    const hours = Math.round((totalMinutes / 60) * 10) / 10;
    return `${hours}h`;
  }

  function computeStats() {
    const { courses, isGroupVisible } = App.state;

    const visibleCourseIds = new Set();
    const sessionsByDay = {};
    DAYS.forEach(day => { sessionsByDay[day] = []; });

    let totalMinutes = 0;

    function addSession(course, session) {
      visibleCourseIds.add(course.id);
      const startMin = toMinutes(session.start);
      const endMin = toMinutes(session.end);
      totalMinutes += (endMin - startMin);
      if (sessionsByDay[session.day]) {
        sessionsByDay[session.day].push({ start: startMin, end: endMin });
      }
    }

    courses.forEach(course => {
      course.theoryGroups.forEach(group => {
        if (isGroupVisible(course.id, 'theory', group.code, false)) {
          (group.theorySessions || []).forEach(session => addSession(course, session));
        }
        (group.labGroups || []).forEach(lab => {
          if (isGroupVisible(course.id, 'lab', lab.code, true)) {
            (lab.sessions || []).forEach(session => addSession(course, session));
          }
        });
      });
    });

    // Huecos: por cada día, ordenar las sesiones visibles y sumar el
    // tiempo muerto entre una y la siguiente (no antes de la primera
    // ni después de la última).
    let gapMinutes = 0;
    Object.values(sessionsByDay).forEach(sessions => {
      if (sessions.length < 2) return;
      const sorted = [...sessions].sort((a, b) => a.start - b.start);
      for (let i = 1; i < sorted.length; i++) {
        const gap = sorted[i].start - sorted[i - 1].end;
        if (gap > 0) gapMinutes += gap;
      }
    });

    return {
      courseCount: visibleCourseIds.size,
      totalMinutes,
      gapMinutes
    };
  }

  function updateStats() {
    const { courseCount, totalMinutes, gapMinutes } = computeStats();
    const conflicts = App.conflicts.checkForConflicts();

    statCoursesValue.textContent = courseCount;
    statHoursValue.textContent = formatHours(totalMinutes);
    statGapsValue.textContent = formatHours(gapMinutes);
    statConflictsValue.textContent = conflicts.length;

    statChipConflicts.classList.toggle('has-conflicts', conflicts.length > 0);

    renderActiveNow();
  }

  // --- "Activo ahora": lo que está visible en la grilla en este
  // momento, sin importar cómo se activó (a mano en "Mis cursos" o
  // aplicando una opción del generador). Se muestra igual en ambas
  // pestañas porque es la misma fuente de datos.

  function computeActiveNow() {
    const { courses, isGroupVisible } = App.state;
    const items = [];

    courses.forEach(course => {
      course.theoryGroups.forEach(group => {
        if (isGroupVisible(course.id, 'theory', group.code, false)) {
          items.push({ name: course.name, code: group.code, color: course.color });
        }
        (group.labGroups || []).forEach(lab => {
          if (isGroupVisible(course.id, 'lab', lab.code, true)) {
            items.push({ name: course.name, code: `${group.code}/${lab.code}`, color: course.color });
          }
        });
      });
    });

    return items;
  }

  function renderActiveNowInto(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const items = computeActiveNow();

    if (items.length === 0) {
      container.innerHTML = '<div class="active-now-empty">Nada activo todavía.</div>';
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="active-now-item">
        <span class="active-now-dot" style="background:${item.color}"></span>
        <span class="active-now-name">${escapeHTML(item.name)}</span>
        <span class="active-now-code">${item.code}</span>
      </div>
    `).join('');
  }

  function renderActiveNow() {
    renderActiveNowInto('activeNowCourses');
    updateActiveNowSaveStar();
  }

  // --- Estrella en "Activo ahora" (Mis cursos): guarda lo que tengas
  // armado a mano en este momento, igual que la estrella de un
  // resultado del generador — misma función compartida en saved-schedules.js.

  const activeNowSaveBtn = document.getElementById('activeNowSaveBtn');

  function getCurrentCombination() {
    const { courses, isGroupVisible } = App.state;
    const combination = [];

    courses.forEach(course => {
      course.theoryGroups.forEach(group => {
        if (isGroupVisible(course.id, 'theory', group.code, false)) {
          const visibleLab = (group.labGroups || []).find(lab =>
            isGroupVisible(course.id, 'lab', lab.code, true)
          );
          combination.push({
            courseId: course.id,
            theoryGroup: group.code,
            labGroup: visibleLab ? visibleLab.code : null
          });
        }
      });
    });

    return combination;
  }

  function updateActiveNowSaveStar() {
    if (!activeNowSaveBtn || !App.savedSchedules) return;
    const combination = getCurrentCombination();
    const isSaved = combination.length > 0 && App.savedSchedules.isCombinationSaved(combination);
    activeNowSaveBtn.classList.toggle('saved', isSaved);
    activeNowSaveBtn.title = isSaved ? 'Ya guardado — toca para quitarlo' : 'Guardar este horario';
  }

  if (activeNowSaveBtn) {
    activeNowSaveBtn.innerHTML = App.icons.icon('star');
    activeNowSaveBtn.addEventListener('click', () => {
      if (App.savedSchedules) {
        App.savedSchedules.toggleSaveCombination(getCurrentCombination(), activeNowSaveBtn);
      }
    });
  }

  function initStatsIcons() {
    document.querySelector('#statChipCourses .stat-icon').innerHTML = App.icons.icon('book');
    document.querySelector('#statChipHours .stat-icon').innerHTML = App.icons.icon('clock');
    document.querySelector('#statChipGaps .stat-icon').innerHTML = App.icons.icon('coffee');
    document.querySelector('#statChipConflicts .stat-icon').innerHTML = App.icons.icon('alert-triangle');
  }

  statChipConflicts.addEventListener('click', () => {
    App.conflicts.highlightConflicts();
  });

  initStatsIcons();

  App.stats = { updateStats };
})(window.App);
