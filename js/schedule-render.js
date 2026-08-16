// Dibuja los bloques de curso en la grilla y aplica .overlapping a los
// que chocan en día+hora. Depende de App.state, App.utils y (en el
// click de cada bloque) de App.modalForm.openModal, al que solo se
// llama en tiempo de ejecución, así que no importa si modal-form.js
// se carga antes o después de este archivo.

window.App = window.App || {};

(function (App) {
  const { escapeHTML, qsa, toMinutes } = App.utils;

  const ROW_HEIGHT = 60;
  const BASE_HOUR = 8;

  function renderCourses() {
    qsa('.course').forEach(course => course.remove());

    App.state.courses.forEach(course => {
      renderCourse(course);
    });

    markOverlappingBlocks();
  }

  function renderCourse(course) {
    const { isGroupVisible } = App.state;

    course.theoryGroups.forEach(group => {
      const groupProfessor = group.professor || '';
      const isTheoryVisible = isGroupVisible(course.id, 'theory', group.code, false);

      if (isTheoryVisible) {
        group.theorySessions.forEach(session => {
          const dayCol = qsa('.day-col').find(col => col.dataset.day === session.day);
          if (!dayCol) return;

          const block = createCourseBlock(course, group, session, groupProfessor, false);
          positionCourseBlock(block, session);
          dayCol.appendChild(block);
        });
      }

      if (group.labGroups && group.labGroups.length > 0) {
        group.labGroups.forEach(labGroup => {
          const labProfessor = labGroup.professor || '';
          const isLabVisible = isGroupVisible(course.id, 'lab', labGroup.code, true);

          if (isLabVisible) {
            if (labGroup.sessions && labGroup.sessions.length > 0) {
              const session = labGroup.sessions[0];
              const dayCol = qsa('.day-col').find(col => col.dataset.day === session.day);
              if (!dayCol) return;

              const block = createCourseBlock(course, labGroup, session, labProfessor || groupProfessor, true);
              positionCourseBlock(block, session);
              dayCol.appendChild(block);
            }
          }
        });
      }
    });
  }

  function createCourseBlock(course, group, session, professor, isLab) {
    const block = document.createElement('div');
    block.className = 'course';
    block.style.background = course.color;
    block.dataset.courseId = course.id;

    let content = `
      <div class="group">${group.code}${isLab ? ' (Lab)' : ''}</div>
      <div class="name">${escapeHTML(course.name)}</div>
      <div class="time">${session.start} - ${session.end}</div>
    `;

    if (professor) {
      content += `<div class="professor">${escapeHTML(professor)}</div>`;
    }

    block.innerHTML = content;

    block.addEventListener('click', (e) => {
      e.stopPropagation();
      const courseToEdit = App.state.courses.find(c => c.id === course.id);
      if (courseToEdit) {
        App.modalForm.openModal(courseToEdit);
      }
    });

    return block;
  }

  function positionCourseBlock(block, session) {
    const startMin = toMinutes(session.start);
    const endMin = toMinutes(session.end);
    const topOffset = ((startMin - BASE_HOUR * 60) / 60) * ROW_HEIGHT;
    const height = ((endMin - startMin) / 60) * ROW_HEIGHT;

    block.style.top = `${topOffset + 2}px`;
    block.style.height = `${Math.max(height - 4, 44)}px`;
  }

  // Marca con .overlapping los bloques cuyo rango vertical ya
  // posicionado se cruza con el de otro bloque en la misma columna de día.
  function markOverlappingBlocks() {
    qsa('.day-col').forEach(dayCol => {
      const blocks = qsa('.course', dayCol).map(el => {
        const top = parseFloat(el.style.top);
        const height = parseFloat(el.style.height);
        return { el, start: top, end: top + height };
      });

      blocks.forEach(b => b.el.classList.remove('overlapping'));

      for (let i = 0; i < blocks.length; i++) {
        for (let j = i + 1; j < blocks.length; j++) {
          const a = blocks[i];
          const b = blocks[j];
          if (a.start < b.end && b.start < a.end) {
            a.el.classList.add('overlapping');
            b.el.classList.add('overlapping');
          }
        }
      }
    });
  }

  App.scheduleRender = { renderCourses };
})(window.App);
