// Panel "Mis cursos": lista de cursos como tarjetas tipo catálogo.
// Cada Grupo Horario / Laboratorio es su propia tarjeta, con un botón
// +/- para activar o desactivar su visibilidad en la grilla — cuando
// está visible, la tarjeta se resalta con el color del curso.
// Depende de App.state, App.utils, App.conflicts, App.icons y App.stats;
// llama a App.generator.renderGeneratorUI en tiempo de ejecución (no
// importa el orden de carga con generator.js).

window.App = window.App || {};

(function (App) {
  const { escapeHTML, formatTimeRange, qsa, hexToRgba } = App.utils;

  const coursesList = document.getElementById('coursesList');
  const emptyState = document.getElementById('emptyState');
  const showAllBtn = document.getElementById('showAllBtn');
  const hideAllBtn = document.getElementById('hideAllBtn');

  function renderSidebar() {
    const { courses, isGroupVisible } = App.state;

    if (courses.length === 0) {
      emptyState.style.display = 'block';
      coursesList.innerHTML = '';
      App.stats.updateStats();
      return;
    }

    emptyState.style.display = 'none';

    const coursesHTML = courses.map(course => {
      const courseGroupsHTML = course.theoryGroups.map(group => {
        const theoryVisible = isGroupVisible(course.id, 'theory', group.code, false);

        const labGroupsHTML = (group.labGroups || []).map(lab => {
          const labVisible = isGroupVisible(course.id, 'lab', lab.code, true);
          return renderGroupCardHTML(course, lab, labVisible, true);
        }).join('');

        return renderGroupCardHTML(course, group, theoryVisible, false) + labGroupsHTML;
      }).join('');

      return `
        <div class="course-item" data-course-id="${course.id}">
          <div class="course-item-header" data-course-id="${course.id}">
            <div class="course-color-dot" style="background-color: ${course.color}"></div>
            <div class="course-item-title">${escapeHTML(course.name)}</div>
            <div class="course-item-arrow">›</div>
          </div>
          <div class="course-item-content">
            ${courseGroupsHTML}
          </div>
        </div>
      `;
    }).join('');

    coursesList.innerHTML = coursesHTML;

    setupSidebarEventListeners();
    App.stats.updateStats();
    App.generator.renderGeneratorUI();
  }

  // Una tarjeta por Grupo Horario o por Grupo de Laboratorio. isLab
  // distingue cuál de los dos es, para leer/guardar la visibilidad
  // correcta y mostrar la etiqueta correspondiente.
  function renderGroupCardHTML(course, group, isVisible, isLab) {
    const sessions = isLab
      ? (group.sessions || [])
      : (group.theorySessions || []);

    const sessionsHTML = sessions.map(session => `
      <div class="session-item">
        <div class="session-day">${session.day}</div>
        <div class="session-time">${formatTimeRange(session.start, session.end)}</div>
      </div>
    `).join('') + (group.professor ? `<div class="session-professor">${escapeHTML(group.professor)}</div>` : '');

    const ringStyle = isVisible
      ? `border-color:${course.color}; box-shadow:0 0 0 3px ${hexToRgba(course.color, 0.15)};`
      : '';

    return `
      <div class="course-group ${isVisible ? 'visible' : ''} ${isLab ? 'is-lab' : ''}" style="${ringStyle}"
           data-course-id="${course.id}" data-group-code="${group.code}" data-is-lab="${isLab}">
        <div class="course-group-header">
          <div class="course-group-badges">
            <span class="course-group-type ${isLab ? 'lab' : ''}">${isLab ? 'Lab' : 'Teoría'}</span>
            <span class="course-group-code">${group.code}</span>
          </div>
          <button type="button" class="course-group-toggle ${isVisible ? 'visible' : ''}"
                  data-course-id="${course.id}" data-group-code="${group.code}" data-is-lab="${isLab}"
                  title="${isVisible ? 'Ocultar' : 'Mostrar'}">
            ${isVisible ? App.icons.icon('minus') : App.icons.icon('plus')}
          </button>
        </div>
        <div class="course-group-sessions">
          ${sessionsHTML}
        </div>
      </div>
    `;
  }

  function setupSidebarEventListeners() {
    qsa('.course-item-header').forEach(header => {
      header.addEventListener('click', (e) => {
        e.currentTarget.classList.toggle('expanded');
      });
    });

    qsa('.course-group-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const courseId = btn.dataset.courseId;
        const groupCode = btn.dataset.groupCode;
        const isLab = btn.dataset.isLab === 'true';

        const currentlyVisible = btn.classList.contains('visible');
        const newVisibility = !currentlyVisible;

        App.state.setGroupVisibility(courseId, isLab ? 'lab' : 'theory', groupCode, isLab, newVisibility);

        btn.classList.toggle('visible', newVisibility);
        btn.innerHTML = newVisibility ? App.icons.icon('minus') : App.icons.icon('plus');
        btn.title = newVisibility ? 'Ocultar' : 'Mostrar';

        const groupCard = btn.closest('.course-group');
        groupCard.classList.toggle('visible', newVisibility);

        const course = App.state.courses.find(c => c.id === courseId);
        if (course) {
          groupCard.style.borderColor = newVisibility ? course.color : '';
          groupCard.style.boxShadow = newVisibility ? `0 0 0 3px ${hexToRgba(course.color, 0.15)}` : '';
        }

        App.scheduleRender.renderCourses();
        App.stats.updateStats();
      });
    });
  }

  function showAllGroups() {
    App.state.showAllGroupsState();
    renderSidebar();
    App.scheduleRender.renderCourses();
  }

  function hideAllGroups() {
    App.state.hideAllGroupsState();
    renderSidebar();
    App.scheduleRender.renderCourses();
  }

  showAllBtn.addEventListener('click', showAllGroups);
  hideAllBtn.addEventListener('click', hideAllGroups);

  App.sidebar = { renderSidebar, showAllGroups, hideAllGroups };
})(window.App);
