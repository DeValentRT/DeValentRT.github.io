// Panel lateral: lista de cursos, checkboxes de visibilidad, contadores
// y botones "Mostrar/Ocultar todos". Depende de App.state, App.utils,
// App.conflicts y App.scheduleRender; llama a App.generator.renderGeneratorUI
// en tiempo de ejecución (no importa el orden de carga con generator.js).

window.App = window.App || {};

(function (App) {
  const { escapeHTML, formatTimeRange, qsa } = App.utils;

  const coursesList = document.getElementById('coursesList');
  const emptyState = document.getElementById('emptyState');
  const visibleSessionsCount = document.getElementById('visibleSessionsCount');
  const totalSessionsCount = document.getElementById('totalSessionsCount');
  const conflictAlert = document.getElementById('conflictAlert');
  const showAllBtn = document.getElementById('showAllBtn');
  const hideAllBtn = document.getElementById('hideAllBtn');

  function renderSidebar() {
    const { courses, isGroupVisible } = App.state;

    if (courses.length === 0) {
      emptyState.style.display = 'block';
      coursesList.innerHTML = '';
      return;
    }

    emptyState.style.display = 'none';

    let totalSessions = 0;
    let visibleSessions = 0;

    const coursesHTML = courses.map(course => {
      const courseGroupsHTML = course.theoryGroups.map(group => {
        const theorySessions = group.theorySessions || [];
        const theoryVisible = isGroupVisible(course.id, 'theory', group.code, false);

        let labSessions = 0;
        let visibleLabSessions = 0;
        let labGroupsHTML = '';

        if (group.labGroups && group.labGroups.length > 0) {
          labGroupsHTML = group.labGroups.map(lab => {
            const labSessionCount = lab.sessions ? 1 : 0;
            const labVisible = isGroupVisible(course.id, 'lab', lab.code, true);

            labSessions += labSessionCount;
            if (labVisible) visibleLabSessions += labSessionCount;

            return renderLabGroupHTML(course, group, lab, labVisible);
          }).join('');
        }

        const groupSessionCount = theorySessions.length + labSessions;
        const groupVisibleSessions = (theoryVisible ? theorySessions.length : 0) + visibleLabSessions;

        totalSessions += groupSessionCount;
        visibleSessions += groupVisibleSessions;

        return renderTheoryGroupHTML(course, group, theoryVisible, groupVisibleSessions, groupSessionCount, labGroupsHTML);
      }).join('');

      return `
        <div class="course-item" data-course-id="${course.id}">
          <div class="course-item-header" data-course-id="${course.id}">
            <div class="course-color-dot" style="background-color: ${course.color}"></div>
            <div class="course-item-title">${escapeHTML(course.name)}</div>
            <div class="course-item-arrow">▸</div>
          </div>
          <div class="course-item-content">
            ${courseGroupsHTML}
          </div>
        </div>
      `;
    }).join('');

    coursesList.innerHTML = coursesHTML;

    totalSessionsCount.textContent = totalSessions;
    visibleSessionsCount.textContent = visibleSessions;

    setupSidebarEventListeners();
    App.conflicts.checkForConflicts();
    App.generator.renderGeneratorUI();
  }

  function renderTheoryGroupHTML(course, group, isVisible, visibleSessions, totalSessions, labGroupsHTML) {
    const sessionsHTML = (group.theorySessions || []).map(session => `
      <div class="session-item">
        <div class="session-day">${session.day}</div>
        <div class="session-time">${formatTimeRange(session.start, session.end)}</div>
      </div>
      ${group.professor ? `<div class="session-professor">${escapeHTML(group.professor)}</div>` : ''}
    `).join('');

    return `
      <div class="course-group" data-course-id="${course.id}" data-group-code="${group.code}" data-is-lab="false">
        <div class="course-group-header">
          <div class="course-group-type">Teoría</div>
          <div class="course-group-code">${group.code}</div>
          <div class="course-group-visibility ${isVisible ? 'visible' : ''}" 
               data-course-id="${course.id}" 
               data-group-code="${group.code}" 
               data-is-lab="false">
          </div>
        </div>
        <div class="course-group-sessions">
          ${sessionsHTML}
        </div>
        ${labGroupsHTML}
      </div>
    `;
  }

  function renderLabGroupHTML(course, parentGroup, lab, isVisible) {
    const session = lab.sessions && lab.sessions.length > 0 ? lab.sessions[0] : null;
    const sessionsHTML = session ? `
      <div class="session-item">
        <div class="session-day">${session.day}</div>
        <div class="session-time">${formatTimeRange(session.start, session.end)}</div>
      </div>
      ${lab.professor ? `<div class="session-professor">${escapeHTML(lab.professor)}</div>` : ''}
    ` : '';

    return `
      <div class="course-group" data-course-id="${course.id}" data-group-code="${lab.code}" data-is-lab="true">
        <div class="course-group-header">
          <div class="course-group-type lab">Lab</div>
          <div class="course-group-code">${lab.code}</div>
          <div class="course-group-visibility ${isVisible ? 'visible' : ''}" 
               data-course-id="${course.id}" 
               data-group-code="${lab.code}" 
               data-is-lab="true">
          </div>
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

    qsa('.course-group-visibility').forEach(checkbox => {
      checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        const courseId = checkbox.dataset.courseId;
        const groupCode = checkbox.dataset.groupCode;
        const isLab = checkbox.dataset.isLab === 'true';

        const currentlyVisible = checkbox.classList.contains('visible');
        const newVisibility = !currentlyVisible;

        App.state.setGroupVisibility(courseId, isLab ? 'lab' : 'theory', groupCode, isLab, newVisibility);

        checkbox.classList.toggle('visible', newVisibility);

        App.scheduleRender.renderCourses();
        updateSessionCounters();
        App.conflicts.checkForConflicts();
      });
    });

    conflictAlert.addEventListener('click', () => {
      App.conflicts.highlightConflicts();
    });
  }

  function updateSessionCounters() {
    const { courses, isGroupVisible } = App.state;
    let totalSessions = 0;
    let visibleSessions = 0;

    courses.forEach(course => {
      course.theoryGroups.forEach(group => {
        const theorySessions = group.theorySessions || [];
        const theoryVisible = isGroupVisible(course.id, 'theory', group.code, false);

        let labSessions = 0;
        let visibleLabSessions = 0;

        if (group.labGroups && group.labGroups.length > 0) {
          group.labGroups.forEach(lab => {
            const labSessionCount = lab.sessions ? 1 : 0;
            const labVisible = isGroupVisible(course.id, 'lab', lab.code, true);

            labSessions += labSessionCount;
            if (labVisible) visibleLabSessions += labSessionCount;
          });
        }

        totalSessions += theorySessions.length + labSessions;
        visibleSessions += (theoryVisible ? theorySessions.length : 0) + visibleLabSessions;
      });
    });

    totalSessionsCount.textContent = totalSessions;
    visibleSessionsCount.textContent = visibleSessions;
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

  App.sidebar = { renderSidebar, updateSessionCounters, showAllGroups, hideAllGroups };
})(window.App);
