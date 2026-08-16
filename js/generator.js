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

  let selectedCourseIds = [];
  let scheduleCombinations = [];
  let selectedCombinationIndex = -1;

  function initScheduleGenerator() {
    selectedCourseIds = App.state.courses.map(course => course.id);

    searchSchedulesBtn.addEventListener('click', findScheduleCombinations);
    resetViewBtn.addEventListener('click', resetScheduleView);

    renderGeneratorUI();
  }

  function renderGeneratorUI() {
    const { courses } = App.state;

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

  function applyScheduleCombination(index) {
    if (index < 0 || index >= scheduleCombinations.length) return;

    selectedCombinationIndex = index;
    const combination = scheduleCombinations[index].courses;

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

  function resetScheduleView() {
    selectedCombinationIndex = -1;
    clearGeneratorResults();

    App.state.showAllGroupsState();

    App.sidebar.renderSidebar();
    App.scheduleRender.renderCourses();
    renderGeneratorUI();
  }

  App.generator = { initScheduleGenerator, renderGeneratorUI };
})(window.App);
