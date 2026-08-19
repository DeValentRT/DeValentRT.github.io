// Estado compartido: cursos, visibilidad y persistencia en localStorage.
// Depende de App.utils, así que este script debe cargarse después de utils.js.

window.App = window.App || {};

(function (App) {
  const { getGroupKey } = App.utils;

  let courses = JSON.parse(localStorage.getItem('courses')) || [];
  let visibilityState = JSON.parse(localStorage.getItem('visibilityState')) || {};
  let savedSchedules = JSON.parse(localStorage.getItem('savedSchedules')) || [];

  const MAX_SAVED_SCHEDULES = 5;

  function setCourses(newCourses) {
    courses = newCourses;
    App.state.courses = courses;
  }

  function saveCourses() {
    localStorage.setItem('courses', JSON.stringify(courses));
  }

  function saveVisibilityState() {
    localStorage.setItem('visibilityState', JSON.stringify(visibilityState));
  }

  function isGroupVisible(courseId, groupType, groupCode, isLab = false) {
    const key = getGroupKey(courseId, groupType, groupCode, isLab);
    return visibilityState[key] !== false; // Por defecto visible
  }

  function setGroupVisibility(courseId, groupType, groupCode, isLab, visible) {
    const key = getGroupKey(courseId, groupType, groupCode, isLab);
    visibilityState[key] = visible;
    saveVisibilityState();
  }

  function removeVisibilityForCourse(courseId) {
    Object.keys(visibilityState).forEach(key => {
      if (key.startsWith(courseId + '_')) {
        delete visibilityState[key];
      }
    });
    saveVisibilityState();
  }

  function showAllGroupsState() {
    courses.forEach(course => {
      course.theoryGroups.forEach(group => {
        setGroupVisibility(course.id, 'theory', group.code, false, true);
        if (group.labGroups) {
          group.labGroups.forEach(lab => {
            setGroupVisibility(course.id, 'lab', lab.code, true, true);
          });
        }
      });
    });
  }

  function hideAllGroupsState() {
    courses.forEach(course => {
      course.theoryGroups.forEach(group => {
        setGroupVisibility(course.id, 'theory', group.code, false, false);
        if (group.labGroups) {
          group.labGroups.forEach(lab => {
            setGroupVisibility(course.id, 'lab', lab.code, true, false);
          });
        }
      });
    });
  }

  // --- Horarios guardados (máximo 5) ---
  // Una combinación es un array de {courseId, theoryGroup, labGroup},
  // el mismo formato que produce el generador de horarios.

  function saveSavedSchedules() {
    localStorage.setItem('savedSchedules', JSON.stringify(savedSchedules));
  }

  function combinationKey(option) {
    return `${option.courseId}|${option.theoryGroup}|${option.labGroup || ''}`;
  }

  function combinationsEqual(a, b) {
    if (a.length !== b.length) return false;
    const setA = new Set(a.map(combinationKey));
    const setB = new Set(b.map(combinationKey));
    if (setA.size !== setB.size) return false;
    for (const key of setA) {
      if (!setB.has(key)) return false;
    }
    return true;
  }

  function findSavedScheduleIndex(combination) {
    return savedSchedules.findIndex(saved => combinationsEqual(saved.combination, combination));
  }

  function addSavedSchedule(combination) {
    if (savedSchedules.length >= MAX_SAVED_SCHEDULES) {
      return { ok: false, reason: 'full' };
    }
    savedSchedules.push({ id: App.utils.generateId(), combination });
    saveSavedSchedules();
    return { ok: true };
  }

  function removeSavedSchedule(id) {
    savedSchedules = savedSchedules.filter(saved => saved.id !== id);
    App.state.savedSchedules = savedSchedules;
    saveSavedSchedules();
  }

  // App.state.courses es la referencia "viva": como es un array, otros
  // módulos pueden hacer push/filter sobre App.state.courses directamente,
  // y para reemplazar el array completo deben llamar a App.state.setCourses().
  App.state = {
    courses,
    visibilityState,
    savedSchedules,
    setCourses,
    saveCourses,
    saveVisibilityState,
    isGroupVisible,
    setGroupVisibility,
    removeVisibilityForCourse,
    showAllGroupsState,
    hideAllGroupsState,
    MAX_SAVED_SCHEDULES,
    findSavedScheduleIndex,
    addSavedSchedule,
    removeSavedSchedule
  };
})(window.App);
