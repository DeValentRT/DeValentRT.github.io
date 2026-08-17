// Modal de añadir/editar curso. Depende de App.state y App.utils, y
// llama a App.sidebar.renderSidebar / App.scheduleRender.renderCourses
// solo en tiempo de ejecución (dentro de funciones), así que no importa
// el orden de carga respecto a esos otros archivos.
//
// Los Grupos Horarios se muestran como tarjetas colapsables con botón
// para eliminarlas, y cada Grupo de Laboratorio tiene su propio botón
// de eliminar. Al crear un grupo o laboratorio nuevo, el código
// (01Q, 90G...) se preselecciona automáticamente al siguiente libre
// (esto es solo un valor por defecto editable, no afecta la lógica
// de guardado ni la del generador de horarios).

window.App = window.App || {};

(function (App) {
  const { generateId, qs, toMinutes } = App.utils;

  const modalBackdrop = document.getElementById('modalBackdrop');
  const openModalBtn = document.getElementById('openModal');
  const closeModalBtn = document.getElementById('closeModal');
  const cancelModalBtn = document.getElementById('cancelModal');
  const form = document.getElementById('courseForm');
  const modalTitle = document.getElementById('modalTitle');
  const submitBtn = document.getElementById('submitBtn');
  const deleteCourseBtn = document.getElementById('deleteCourse');
  const courseIdInput = document.getElementById('courseId');
  const theoryGroupsContainer = document.getElementById('theoryGroupsContainer');
  const addGroupBtn = document.getElementById('addGroupBtn');

  const THEORY_CODES = ['01Q', '02Q', '03Q', '04Q'];
  const LAB_CODES = ['90G', '91G', '92G', '93G', '94G', '95G'];

  let editingCourseId = null;

  // --- Siguiente código libre (solo valor por defecto, editable) ---

  function getNextTheoryCode() {
    const used = new Set(
      [...theoryGroupsContainer.querySelectorAll('.group-select')].map(sel => sel.value)
    );
    return THEORY_CODES.find(code => !used.has(code)) || THEORY_CODES[THEORY_CODES.length - 1];
  }

  function getNextLabCode() {
    // Global a todo el curso: cuenta los labs de TODOS los grupos
    // horarios, no solo los del grupo donde se está agregando.
    const used = new Set(
      [...theoryGroupsContainer.querySelectorAll('.lab-group-select')].map(sel => sel.value)
    );
    return LAB_CODES.find(code => !used.has(code)) || LAB_CODES[LAB_CODES.length - 1];
  }

  function openModal(course = null) {
    if (course) {
      modalTitle.textContent = 'Editar curso';
      submitBtn.textContent = 'Guardar';
      deleteCourseBtn.style.display = 'block';
      editingCourseId = course.id;
      courseIdInput.value = course.id;

      qs('#courseName').value = course.name;
      qs('#courseColor').value = course.color;

      theoryGroupsContainer.innerHTML = '';

      // Si hay más de un grupo, se muestran colapsados salvo el primero,
      // para no abrumar con varias tarjetas abiertas a la vez al editar.
      course.theoryGroups.forEach((group, index) => {
        addGroupContainer(group, index, index > 0);
      });

    } else {
      modalTitle.textContent = 'Añadir curso';
      submitBtn.textContent = 'Guardar curso';
      deleteCourseBtn.style.display = 'none';
      editingCourseId = null;
      courseIdInput.value = '';

      form.reset();
      qs('#courseColor').value = '#4f46e5';

      theoryGroupsContainer.innerHTML = '';
      addGroupContainer();
    }

    App.utils.lockBodyScroll();
    modalBackdrop.style.display = 'flex';
  }

  function closeModal() {
    modalBackdrop.style.display = 'none';
    App.utils.unlockBodyScroll();
  }

  // --- Colapsar / expandir tarjetas de grupo horario ---

  function computeGroupSummaryMeta(groupElement) {
    const professor = groupElement.querySelector('.professor-input').value.trim();
    const sessionRows = [...groupElement.querySelectorAll('.theory-sessions .session-row')];
    const validSessions = sessionRows.filter(row => {
      const day = row.querySelector('.day-select').value;
      const inputs = row.querySelectorAll('.time-input');
      return day && inputs[0].value && inputs[1].value;
    });
    const labCount = groupElement.querySelectorAll('.lab-group').length;

    const parts = [`${validSessions.length} sesión${validSessions.length !== 1 ? 'es' : ''}`];
    if (professor) parts.push(professor);
    if (labCount > 0) parts.push(`${labCount} lab${labCount !== 1 ? 's' : ''}`);

    return ' · ' + parts.join(' · ');
  }

  function collapseGroup(groupElement) {
    const meta = groupElement.querySelector('.group-summary-meta');
    meta.textContent = computeGroupSummaryMeta(groupElement);
    groupElement.classList.add('collapsed');
  }

  function expandGroup(groupElement) {
    groupElement.classList.remove('collapsed');
  }

  function addGroupContainer(groupData = null, index = 0, startCollapsed = false) {
    const groupCode = groupData ? groupData.code : getNextTheoryCode();
    const professor = groupData ? groupData.professor : '';
    const hasLabs = !!(groupData && groupData.labGroups && groupData.labGroups.length > 0);

    const groupHTML = `
      <div class="group-container" data-group-index="${index}">
        <div class="group-summary-header">
          <button type="button" class="group-toggle">
            <span class="group-chevron">›</span>
            <span class="group-summary-text">
              Grupo Horario <strong class="group-code-display">${groupCode}</strong>
              <span class="group-summary-meta"></span>
            </span>
          </button>
          <button type="button" class="btn-remove-group" title="Eliminar grupo horario">×</button>
        </div>

        <div class="group-body">
          <div class="field">
            <label class="label">Grupo de teoría</label>
            <select class="select group-select" data-group-type="theory">
              <option value="01Q" ${groupCode === '01Q' ? 'selected' : ''}>01Q</option>
              <option value="02Q" ${groupCode === '02Q' ? 'selected' : ''}>02Q</option>
              <option value="03Q" ${groupCode === '03Q' ? 'selected' : ''}>03Q</option>
              <option value="04Q" ${groupCode === '04Q' ? 'selected' : ''}>04Q</option>
            </select>
          </div>

          <div class="field">
            <label class="label">Profesor de teoría (opcional)</label>
            <input class="input professor-input" type="text" placeholder="Ej. Lic. Huamanizzz" value="${professor || ''}" />
          </div>

          <div class="sessions-section">
            <div class="section-label">Horarios de teoría</div>
            <div class="theory-sessions">
              ${groupData && groupData.theorySessions && groupData.theorySessions.length > 0 
                ? groupData.theorySessions.map(session => createSessionHTML(session)).join('')
                : createEmptySessionHTML()
              }
            </div>
            <button type="button" class="btn-add" data-type="theory-session">
              + Añadir horario de teoría
            </button>
          </div>

          <div class="labs-section">
            <div class="section-label">Laboratorios (opcional)</div>
            <button type="button" class="btn-add" data-type="toggle-labs">
              ${hasLabs ? '- Ocultar laboratorios' : '+ Añadir laboratorios'}
            </button>

            <div class="labs-container" style="display: ${hasLabs ? 'block' : 'none'}">
              ${hasLabs
                ? groupData.labGroups.map(lab => createLabGroupHTML(lab, groupCode)).join('')
                : ''
              }
            </div>

            <button type="button" class="btn-add btn-add-lab-group" data-type="add-lab-group" style="display: ${hasLabs ? 'block' : 'none'}">
              + Añadir otro grupo de laboratorio
            </button>
          </div>
        </div>
      </div>
    `;

    theoryGroupsContainer.insertAdjacentHTML('beforeend', groupHTML);

    const groupElement = theoryGroupsContainer.lastElementChild;

    const groupSelect = groupElement.querySelector('.group-select');
    const groupCodeDisplay = groupElement.querySelector('.group-code-display');
    groupSelect.addEventListener('change', (e) => {
      groupCodeDisplay.textContent = e.target.value;
      // El código del grupo cambió: actualizar el prefijo mostrado
      // en todos sus laboratorios (ej. "01Q/90G" -> "03Q/90G").
      groupElement.querySelectorAll('.lab-code-prefix').forEach(prefixEl => {
        prefixEl.textContent = e.target.value;
      });
    });

    setupGroupEventListeners(groupElement);
    attachSessionEventListeners(groupElement);

    // Wire de los laboratorios que ya venían con el curso (modo edición).
    groupElement.querySelectorAll('.lab-group').forEach(labGroupEl => {
      setupLabEventListeners(labGroupEl, groupElement);
    });

    if (startCollapsed) {
      collapseGroup(groupElement);
    }
  }

  function createEmptySessionHTML() {
    return `
      <div class="session-row">
        <select class="select day-select">
          <option value="">Seleccionar día...</option>
          <option value="Lunes">Lunes</option>
          <option value="Martes">Martes</option>
          <option value="Miércoles">Miércoles</option>
          <option value="Jueves">Jueves</option>
          <option value="Viernes">Viernes</option>
        </select>
        <div class="time-inputs">
          <input type="time" class="input time-input" value="" min="08:00" max="22:00" step="300">
          <span class="time-separator">-</span>
          <input type="time" class="input time-input" value="" min="08:30" max="22:00" step="300">
        </div>
        <button type="button" class="btn-remove" title="Eliminar">×</button>
      </div>
    `;
  }

  function createSessionHTML(session = null) {
    const day = session ? session.day : '';
    const start = session ? session.start : '';
    const end = session ? session.end : '';

    return `
      <div class="session-row">
        <select class="select day-select">
          <option value="" ${!day ? 'selected' : ''}>Seleccionar día...</option>
          <option value="Lunes" ${day === 'Lunes' ? 'selected' : ''}>Lunes</option>
          <option value="Martes" ${day === 'Martes' ? 'selected' : ''}>Martes</option>
          <option value="Miércoles" ${day === 'Miércoles' ? 'selected' : ''}>Miércoles</option>
          <option value="Jueves" ${day === 'Jueves' ? 'selected' : ''}>Jueves</option>
          <option value="Viernes" ${day === 'Viernes' ? 'selected' : ''}>Viernes</option>
        </select>
        <div class="time-inputs">
          <input type="time" class="input time-input" value="${start}" min="08:00" max="22:00" step="300">
          <span class="time-separator">-</span>
          <input type="time" class="input time-input" value="${end}" min="08:30" max="22:00" step="300">
        </div>
        <button type="button" class="btn-remove" title="Eliminar">×</button>
      </div>
    `;
  }

  // parentGroupCode es el código del grupo horario dueño de este lab
  // (para mostrarlo como "01Q/90G"). labGroup null = laboratorio nuevo,
  // así que su código se auto-asigna al siguiente libre.
  function createLabGroupHTML(labGroup = null, parentGroupCode = '01Q') {
    const labCode = labGroup ? labGroup.code : getNextLabCode();
    const labProfessor = labGroup ? labGroup.professor : '';
    const session = labGroup && labGroup.sessions && labGroup.sessions.length > 0
      ? labGroup.sessions[0]
      : null;

    return `
      <div class="lab-group">
        <div class="lab-group-header">
          <div class="lab-group-title">
            Laboratorio <strong><span class="lab-code-prefix">${parentGroupCode}</span>/<span class="lab-code-display">${labCode}</span></strong>
          </div>
          <button type="button" class="btn-remove-lab" title="Eliminar laboratorio">×</button>
        </div>

        <div class="field">
          <label class="label">Grupo de laboratorio</label>
          <select class="select lab-group-select">
            <option value="90G" ${labCode === '90G' ? 'selected' : ''}>90G</option>
            <option value="91G" ${labCode === '91G' ? 'selected' : ''}>91G</option>
            <option value="92G" ${labCode === '92G' ? 'selected' : ''}>92G</option>
            <option value="93G" ${labCode === '93G' ? 'selected' : ''}>93G</option>
            <option value="94G" ${labCode === '94G' ? 'selected' : ''}>94G</option>
            <option value="95G" ${labCode === '95G' ? 'selected' : ''}>95G</option>
          </select>
        </div>

        <div class="field">
          <label class="label">Profesor de laboratorio (opcional)</label>
          <input class="input lab-professor-input" type="text" placeholder="Ej. Prof. Bellidozzz" value="${labProfessor || ''}" />
        </div>

        <div class="lab-sessions">
          ${createSessionHTML(session)}
        </div>
      </div>
    `;
  }

  // Agrega un nuevo laboratorio dentro de este grupo horario, leyendo
  // el código de grupo actual (por si el usuario lo cambió) para el prefijo.
  function appendLabGroup(groupElement) {
    const labsContainer = groupElement.querySelector('.labs-container');
    const parentGroupCode = groupElement.querySelector('.group-select').value;

    labsContainer.insertAdjacentHTML('beforeend', createLabGroupHTML(null, parentGroupCode));

    const newLabGroup = labsContainer.lastElementChild;
    setupLabEventListeners(newLabGroup, groupElement);
  }

  function setupGroupEventListeners(groupElement) {
    const addTheoryBtn = groupElement.querySelector('.btn-add[data-type="theory-session"]');
    addTheoryBtn.addEventListener('click', () => {
      const theorySessions = groupElement.querySelector('.theory-sessions');
      theorySessions.insertAdjacentHTML('beforeend', createEmptySessionHTML());
      attachSessionEventListeners(groupElement);
    });

    const toggleLabsBtn = groupElement.querySelector('.btn-add[data-type="toggle-labs"]');
    const labsContainer = groupElement.querySelector('.labs-container');
    const addLabGroupBtn = groupElement.querySelector('.btn-add[data-type="add-lab-group"]');

    toggleLabsBtn.addEventListener('click', () => {
      if (labsContainer.style.display === 'none') {
        labsContainer.style.display = 'block';
        toggleLabsBtn.textContent = '- Ocultar laboratorios';
        addLabGroupBtn.style.display = 'block';

        if (labsContainer.children.length === 0) {
          appendLabGroup(groupElement);
        }
      } else {
        labsContainer.style.display = 'none';
        toggleLabsBtn.textContent = '+ Añadir laboratorios';
        addLabGroupBtn.style.display = 'none';
      }
    });

    addLabGroupBtn.addEventListener('click', () => {
      appendLabGroup(groupElement);
    });

    const toggleBtn = groupElement.querySelector('.group-toggle');
    toggleBtn.addEventListener('click', () => {
      if (groupElement.classList.contains('collapsed')) {
        expandGroup(groupElement);
      } else {
        collapseGroup(groupElement);
      }
    });

    const removeGroupBtn = groupElement.querySelector('.btn-remove-group');
    removeGroupBtn.addEventListener('click', () => {
      const allGroups = theoryGroupsContainer.querySelectorAll('.group-container');
      if (allGroups.length <= 1) {
        alert('Debe haber al menos un grupo horario.');
        return;
      }
      groupElement.remove();
    });
  }

  function setupLabEventListeners(labGroupElement, parentGroupElement) {
    const labSelect = labGroupElement.querySelector('.lab-group-select');
    const labCodeDisplay = labGroupElement.querySelector('.lab-code-display');
    labSelect.addEventListener('change', (e) => {
      labCodeDisplay.textContent = e.target.value;
    });

    const removeLabBtn = labGroupElement.querySelector('.btn-remove-lab');
    removeLabBtn.addEventListener('click', () => {
      const labsContainer = parentGroupElement.querySelector('.labs-container');
      const toggleLabsBtn = parentGroupElement.querySelector('.btn-add[data-type="toggle-labs"]');
      const addLabGroupBtn = parentGroupElement.querySelector('.btn-add[data-type="add-lab-group"]');

      labGroupElement.remove();

      if (labsContainer.children.length === 0) {
        labsContainer.style.display = 'none';
        toggleLabsBtn.textContent = '+ Añadir laboratorios';
        addLabGroupBtn.style.display = 'none';
      }
    });
  }

  function attachSessionEventListeners(groupElement) {
    groupElement.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sessionRow = e.target.closest('.session-row');
        const sessionsContainer = sessionRow.parentElement;

        if (sessionsContainer.classList.contains('theory-sessions')) {
          if (sessionsContainer.children.length > 1) {
            sessionRow.remove();
          }
        } else {
          sessionRow.remove();
          if (sessionsContainer.children.length === 0) {
            sessionsContainer.insertAdjacentHTML('beforeend', createEmptySessionHTML());
            attachSessionEventListeners(groupElement);
          }
        }
      });
    });
  }

  function collectFormData() {
    const courseName = qs('#courseName').value.trim();
    const color = qs('#courseColor').value;

    if (!courseName) {
      alert('Por favor, ingresa el nombre del curso.');
      return null;
    }

    const theoryGroups = [];
    const groupContainers = theoryGroupsContainer.querySelectorAll('.group-container');

    for (const container of groupContainers) {
      const groupCode = container.querySelector('.group-select').value;
      const professor = container.querySelector('.professor-input').value.trim();

      const theorySessions = [];
      const theoryRows = container.querySelectorAll('.theory-sessions .session-row');

      for (const row of theoryRows) {
        const day = row.querySelector('.day-select').value;
        const start = row.querySelectorAll('.time-input')[0].value;
        const end = row.querySelectorAll('.time-input')[1].value;

        if (day && start && end && toMinutes(end) > toMinutes(start)) {
          theorySessions.push({ day, start, end });
        } else if (day || start || end) {
          alert(`Por favor, completa todos los campos del horario de teoría para el grupo ${groupCode}.`);
          return null;
        }
      }

      if (theorySessions.length === 0) {
        alert(`El grupo ${groupCode} debe tener al menos un horario de teoría completo.`);
        return null;
      }

      const labGroups = [];
      const labContainers = container.querySelectorAll('.lab-group');

      for (const labContainer of labContainers) {
        const labCode = labContainer.querySelector('.lab-group-select').value;
        const labProfessor = labContainer.querySelector('.lab-professor-input').value.trim();

        const labRow = labContainer.querySelector('.lab-sessions .session-row');
        if (labRow) {
          const day = labRow.querySelector('.day-select').value;
          const start = labRow.querySelectorAll('.time-input')[0].value;
          const end = labRow.querySelectorAll('.time-input')[1].value;

          if (day && start && end && toMinutes(end) > toMinutes(start)) {
            labGroups.push({
              code: labCode,
              professor: labProfessor,
              sessions: [{ day, start, end }]
            });
          } else if (day || start || end) {
            alert(`Por favor, completa todos los campos del horario de laboratorio ${labCode}.`);
            return null;
          }
        }
      }

      theoryGroups.push({
        code: groupCode,
        professor: professor,
        theorySessions,
        labGroups
      });
    }

    if (theoryGroups.length === 0) {
      alert('Debe haber al menos un grupo horario.');
      return null;
    }

    return {
      name: courseName,
      color,
      theoryGroups
    };
  }

  function addOrUpdateCourse(courseData) {
    const { courses } = App.state;

    if (editingCourseId) {
      const index = courses.findIndex(c => c.id === editingCourseId);
      if (index !== -1) {
        courseData.id = editingCourseId;
        courses[index] = courseData;
      }
    } else {
      courseData.id = generateId();
      courses.push(courseData);

      courseData.theoryGroups.forEach(group => {
        App.state.setGroupVisibility(courseData.id, 'theory', group.code, false, true);

        if (group.labGroups) {
          group.labGroups.forEach(lab => {
            App.state.setGroupVisibility(courseData.id, 'lab', lab.code, true, true);
          });
        }
      });
    }

    App.state.saveCourses();
    App.sidebar.renderSidebar();
    App.scheduleRender.renderCourses();
  }

  function deleteCourse(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este curso?')) {
      App.state.removeVisibilityForCourse(id);

      App.state.setCourses(App.state.courses.filter(course => course.id !== id));
      App.state.saveCourses();

      App.sidebar.renderSidebar();
      App.scheduleRender.renderCourses();
      closeModal();
    }
  }

  openModalBtn.addEventListener('click', () => openModal());
  closeModalBtn.addEventListener('click', closeModal);
  cancelModalBtn.addEventListener('click', closeModal);

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  addGroupBtn.addEventListener('click', () => {
    const existingGroups = theoryGroupsContainer.querySelectorAll('.group-container');
    existingGroups.forEach(g => collapseGroup(g));

    const groupCount = existingGroups.length;
    addGroupContainer(null, groupCount, false);
  });

  deleteCourseBtn.addEventListener('click', () => {
    if (editingCourseId) {
      deleteCourse(editingCourseId);
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const courseData = collectFormData();
    if (courseData) {
      addOrUpdateCourse(courseData);
      closeModal();
    }
  });

  App.modalForm = { openModal };
})(window.App);
