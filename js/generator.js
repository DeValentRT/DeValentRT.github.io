// Generador de horarios: dado un subconjunto de cursos, calcula todas
// las combinaciones posibles de grupo teórico × laboratorio y filtra
// las que no tienen conflictos entre sí.

window.App = window.App || {};

(function (App) {
  const { escapeHTML, qsa, toMinutes } = App.utils;

  const coursesSelection = document.getElementById('coursesSelection');
  const selectedCoursesCount = document.getElementById('selectedCoursesCount');
  const searchCount = document.getElementById('searchCount');
  const searchSchedulesBtn = document.getElementById('searchSchedulesBtn');
  const generatorResults = document.getElementById('generatorResults');
  const resultsCount = document.getElementById('resultsCount');
  const resultsList = document.getElementById('resultsList');
  const noResults = document.getElementById('noResults');
  const noResultsCount = document.getElementById('noResultsCount');
  const resetViewBtn = document.getElementById('resetViewBtn');
  const incompatibleCount = document.getElementById('incompatibleCount');
  const incompatibleList = document.getElementById('incompatibleList');
  const incompatibleChip = document.getElementById('incompatibleChip');

  let selectedCourseIds = [];
  let scheduleCombinations = [];
  let selectedCombinationIndex = -1;

  incompatibleChip.querySelector('.stat-icon').innerHTML = App.icons.icon('alert-triangle');

  function initScheduleGenerator() {
    selectedCourseIds = App.state.courses.map(course => course.id);

    searchSchedulesBtn.addEventListener('click', findScheduleCombinations);
    resetViewBtn.addEventListener('click', resetScheduleView);

    renderGeneratorUI();
  }

  function renderGeneratorUI() {
    const { courses } = App.state;

    renderIncompatiblePairs();

    if (courses.length === 0) {
      coursesSelection.innerHTML = `
        <div class="generator-empty-state">
          No hay cursos disponibles
          <span>Añade cursos para usar el generador</span>
        </div>
      `;
      searchSchedulesBtn.disabled = true;
      return;
    }

    const coursesHTML = courses.map(course => {
      const isSelected = selectedCourseIds.includes(course.id);
      return `
        <div class="course-selection-item" data-course-id="${course.id}">
          <div class="course-selection-checkbox ${isSelected ? 'checked' : ''}" 
               data-course-id="${course.id}"></div>
          <div class="course-selection-info">
            <div class="course-selection-color" style="background-color: ${course.color}"></div>
            <div class="course-selection-name">${escapeHTML(course.name)}</div>
          </div>
        </div>
      `;
    }).join('');

    coursesSelection.innerHTML = coursesHTML;

    const selectedCount = selectedCourseIds.length;
    selectedCoursesCount.textContent = selectedCount;
    searchCount.textContent = selectedCount;

    searchSchedulesBtn.disabled = selectedCount === 0;

    if (scheduleCombinations.length > 0) {
      generatorResults.style.display = 'block';
      resultsCount.textContent = scheduleCombinations.length;
      noResults.style.display = 'none';

      const resultsHTML = scheduleCombinations.map((combination, index) => {
        const isSelected = index === selectedCombinationIndex;
        const courseCount = combination.courses.length;
        const conflictCount = combination.hasConflict ? 1 : 0;
        const isSaved = App.state.findSavedScheduleIndex(combination.courses) !== -1;

        return `
          <div class="result-option ${isSelected ? 'selected' : ''}" data-index="${index}">
            <div class="result-option-radio"></div>
            <div class="result-option-info">
              <div class="result-option-title">Opción ${index + 1}</div>
              <div class="result-option-details">
                ${courseCount} curso${courseCount !== 1 ? 's' : ''}, 
                <span>${conflictCount} conflicto${conflictCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <button type="button" class="result-star ${isSaved ? 'saved' : ''}" data-index="${index}"
                    title="${isSaved ? 'Ya guardado — toca para quitarlo' : 'Guardar este horario'}">
              ${App.icons.icon('star')}
            </button>
          </div>
        `;
      }).join('');

      resultsList.innerHTML = resultsHTML;
      resetViewBtn.style.display = 'block';

      qsa('.result-option').forEach(option => {
        option.addEventListener('click', () => {
          const index = parseInt(option.dataset.index);
          applyScheduleCombination(index);
        });
      });

      qsa('.result-star').forEach(starBtn => {
        starBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const index = parseInt(starBtn.dataset.index);
          toggleSaveCombination(scheduleCombinations[index].courses, starBtn);
        });
      });
    } else if (generatorResults.style.display === 'block') {
      noResults.style.display = 'block';
      noResultsCount.textContent = selectedCount;
      resultsList.innerHTML = '';
      resetViewBtn.style.display = 'block';
    } else {
      generatorResults.style.display = 'none';
      resetViewBtn.style.display = 'none';
    }

    qsa('.course-selection-checkbox').forEach(checkbox => {
      checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        const courseId = checkbox.dataset.courseId;
        toggleCourseSelection(courseId);
      });
    });

    qsa('.course-selection-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.classList.contains('course-selection-checkbox')) {
          const courseId = item.dataset.courseId;
          toggleCourseSelection(courseId);
        }
      });
    });
  }

  function toggleCourseSelection(courseId) {
    const index = selectedCourseIds.indexOf(courseId);

    if (index === -1) {
      selectedCourseIds.push(courseId);
    } else {
      selectedCourseIds.splice(index, 1);
    }

    clearGeneratorResults();
    renderGeneratorUI();
  }

  function toggleSaveCombination(combination, starBtn) {
    App.savedSchedules.toggleSaveCombination(combination, starBtn);
  }

  function clearGeneratorResults() {
    scheduleCombinations = [];
    selectedCombinationIndex = -1;
    generatorResults.style.display = 'none';
    resetViewBtn.style.display = 'none';
  }

  function generateCourseOptions(course) {
    const options = [];

    const hasLabs = course.theoryGroups.some(group =>
      group.labGroups && group.labGroups.length > 0
    );

    if (hasLabs) {
      const allGroupsHaveLabs = course.theoryGroups.every(group =>
        group.labGroups && group.labGroups.length > 0
      );

      if (!allGroupsHaveLabs) {
        console.warn(`Curso "${course.name}" tiene inconsistencia en labs. Algunos grupos tienen labs y otros no.`);
        return [];
      }
    }

    course.theoryGroups.forEach(group => {
      if (hasLabs) {
        if (group.labGroups && group.labGroups.length > 0) {
          group.labGroups.forEach(lab => {
            const labSession = lab.sessions && lab.sessions.length > 0 ? lab.sessions[0] : null;
            const allSessions = [
              ...(group.theorySessions || [])
            ];

            if (labSession) {
              allSessions.push(labSession);
            }

            options.push({
              courseId: course.id,
              theoryGroup: group.code,
              labGroup: lab.code,
              sessions: allSessions
            });
          });
        }
      } else {
        options.push({
          courseId: course.id,
          theoryGroup: group.code,
          labGroup: null,
          sessions: [...(group.theorySessions || [])]
        });
      }
    });

    return options;
  }

  function cartesianProduct(arrays) {
    return arrays.reduce((acc, curr) => {
      const result = [];
      acc.forEach(a => {
        curr.forEach(b => {
          result.push([...a, b]);
        });
      });
      return result;
    }, [[]]);
  }

  function checkCombinationConflict(combination) {
    const allSessions = [];

    combination.forEach(option => {
      option.sessions.forEach(session => {
        allSessions.push({
          courseId: option.courseId,
          theoryGroup: option.theoryGroup,
          labGroup: option.labGroup,
          ...session,
          startMin: toMinutes(session.start),
          endMin: toMinutes(session.end)
        });
      });
    });

    for (let i = 0; i < allSessions.length; i++) {
      for (let j = i + 1; j < allSessions.length; j++) {
        const s1 = allSessions[i];
        const s2 = allSessions[j];

        if (s1.day === s2.day &&
            s1.startMin < s2.endMin &&
            s2.startMin < s1.endMin) {
          return true;
        }
      }
    }

    return false;
  }

  // Recorre TODOS los cursos agregados (sin importar si están
  // seleccionados en el generador o visibles en la grilla) y detecta
  // pares donde, sin importar qué grupo/lab elijas de cada uno, SIEMPRE
  // hay cruce de horario. Se recalcula cada vez que se renderiza el
  // generador, para que quede siempre al día.
  function computeIncompatiblePairs() {
    const { courses } = App.state;
    const pairs = [];

    for (let i = 0; i < courses.length; i++) {
      for (let j = i + 1; j < courses.length; j++) {
        const courseA = courses[i];
        const courseB = courses[j];
        const optionsA = generateCourseOptions(courseA);
        const optionsB = generateCourseOptions(courseB);

        // Curso con inconsistencia de labs (sin opciones válidas): no
        // se puede evaluar, se omite de este diagnóstico.
        if (optionsA.length === 0 || optionsB.length === 0) continue;

        let allConflict = true;
        for (const optA of optionsA) {
          for (const optB of optionsB) {
            if (!checkCombinationConflict([optA, optB])) {
              allConflict = false;
              break;
            }
          }
          if (!allConflict) break;
        }

        if (allConflict) {
          pairs.push({ nameA: courseA.name, nameB: courseB.name });
        }
      }
    }

    return pairs;
  }

  function renderIncompatiblePairs() {
    const pairs = computeIncompatiblePairs();

    incompatibleCount.textContent = pairs.length;
    incompatibleChip.classList.toggle('has-conflicts', pairs.length > 0);

    if (pairs.length > 0) {
      incompatibleList.innerHTML = pairs
        .map(p => `<li>${escapeHTML(p.nameA)} ↔ ${escapeHTML(p.nameB)}</li>`)
        .join('');
      incompatibleList.style.display = 'block';
    } else {
      incompatibleList.innerHTML = '';
      incompatibleList.style.display = 'none';
    }
  }

  function findScheduleCombinations() {
    clearGeneratorResults();

    const { courses } = App.state;
    const selectedCourses = courses.filter(course =>
      selectedCourseIds.includes(course.id)
    );

    if (selectedCourses.length === 0) {
      alert('Selecciona al menos un curso para buscar horarios.');
      return;
    }

    const courseOptions = selectedCourses.map(course =>
      generateCourseOptions(course)
    );

    const invalidCourses = selectedCourses.filter((course, index) =>
      courseOptions[index].length === 0
    );

    if (invalidCourses.length > 0) {
      alert(`Los siguientes cursos tienen inconsistencia en laboratorios (algunos grupos tienen labs y otros no):\n\n${
        invalidCourses.map(c => c.name).join(', ')
      }\n\nPor favor, edita estos cursos para que todos los grupos tengan labs o ninguno tenga.`);
      return;
    }

    const allCombinations = cartesianProduct(courseOptions);

    console.log(`Buscando entre ${allCombinations.length} combinaciones posibles...`);

    scheduleCombinations = allCombinations
      .map(combination => ({
        courses: combination,
        hasConflict: checkCombinationConflict(combination)
      }))
      .filter(combination => !combination.hasConflict);

    console.log(`Encontradas ${scheduleCombinations.length} combinaciones sin conflictos.`);

    if (scheduleCombinations.length > 0) {
      generatorResults.style.display = 'block';
      selectedCombinationIndex = -1;
    } else {
      generatorResults.style.display = 'block';
      noResults.style.display = 'block';
      noResultsCount.textContent = selectedCourses.length;
    }

    renderGeneratorUI();
  }

  // Aplica una combinación (array de {courseId, theoryGroup, labGroup})
  // como la visibilidad activa: oculta todo lo demás y muestra solo
  // esto. La usan tanto "aplicar un resultado del generador" como
  // "aplicar un horario guardado" — misma lógica, un solo lugar.
  function applyCombination(combination) {
    App.state.hideAllGroupsState();

    combination.forEach(option => {
      const course = App.state.courses.find(c => c.id === option.courseId);
      if (!course) return;

      const theoryGroup = course.theoryGroups.find(g => g.code === option.theoryGroup);
      if (!theoryGroup) return;

      App.state.setGroupVisibility(course.id, 'theory', option.theoryGroup, false, true);

      if (option.labGroup) {
        App.state.setGroupVisibility(course.id, 'lab', option.labGroup, true, true);
      }
    });

    App.sidebar.renderSidebar();
    App.scheduleRender.renderCourses();
    renderGeneratorUI();
  }

  function applyScheduleCombination(index) {
    if (index < 0 || index >= scheduleCombinations.length) return;

    selectedCombinationIndex = index;
    applyCombination(scheduleCombinations[index].courses);
  }

  function resetScheduleView() {
    selectedCombinationIndex = -1;
    clearGeneratorResults();

    App.state.showAllGroupsState();

    App.sidebar.renderSidebar();
    App.scheduleRender.renderCourses();
    renderGeneratorUI();
  }

  App.generator = { initScheduleGenerator, renderGeneratorUI, applyCombination };
})(window.App);
