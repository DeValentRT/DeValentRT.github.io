// Detección y resaltado de conflictos entre sesiones visibles.
// Depende de App.state y App.utils.

window.App = window.App || {};

(function (App) {
  const { toMinutes, qs, qsa } = App.utils;

  const conflictAlert = document.getElementById('conflictAlert');
  const conflictCount = document.getElementById('conflictCount');

  let highlightedConflicts = [];

  function checkForConflicts() {
    const { courses, isGroupVisible } = App.state;
    const visibleSessions = [];
    const conflicts = [];

    courses.forEach(course => {
      course.theoryGroups.forEach(group => {
        if (isGroupVisible(course.id, 'theory', group.code, false)) {
          (group.theorySessions || []).forEach(session => {
            visibleSessions.push({
              courseId: course.id,
              groupCode: group.code,
              courseName: course.name,
              courseColor: course.color,
              isLab: false,
              ...session,
              startMin: toMinutes(session.start),
              endMin: toMinutes(session.end)
            });
          });
        }

        if (group.labGroups) {
          group.labGroups.forEach(lab => {
            if (isGroupVisible(course.id, 'lab', lab.code, true)) {
              if (lab.sessions && lab.sessions.length > 0) {
                const session = lab.sessions[0];
                visibleSessions.push({
                  courseId: course.id,
                  groupCode: lab.code,
                  courseName: course.name,
                  courseColor: course.color,
                  isLab: true,
                  ...session,
                  startMin: toMinutes(session.start),
                  endMin: toMinutes(session.end)
                });
              }
            }
          });
        }
      });
    });

    for (let i = 0; i < visibleSessions.length; i++) {
      for (let j = i + 1; j < visibleSessions.length; j++) {
        const s1 = visibleSessions[i];
        const s2 = visibleSessions[j];

        if (s1.day === s2.day &&
            s1.startMin < s2.endMin &&
            s2.startMin < s1.endMin) {

          conflicts.push({
            session1: s1,
            session2: s2,
            day: s1.day,
            overlapStart: Math.max(s1.startMin, s2.startMin),
            overlapEnd: Math.min(s1.endMin, s2.endMin)
          });
        }
      }
    }

    if (conflicts.length > 0) {
      conflictCount.textContent = conflicts.length;
      conflictAlert.style.display = 'flex';
    } else {
      conflictAlert.style.display = 'none';
    }

    highlightedConflicts = conflicts;

    return conflicts;
  }

  function highlightConflicts() {
    qsa('.course.conflict').forEach(course => {
      course.classList.remove('conflict');
    });

    if (highlightedConflicts.length === 0) return;

    highlightedConflicts.forEach(conflict => {
      const { session1, session2 } = conflict;

      qsa('.course').forEach(courseBlock => {
        const courseId = courseBlock.dataset.courseId;
        const blockText = courseBlock.textContent;

        if ((courseId === session1.courseId && blockText.includes(session1.groupCode)) ||
            (courseId === session2.courseId && blockText.includes(session2.groupCode))) {
          courseBlock.classList.add('conflict');
        }
      });
    });

    const firstConflict = qs('.course.conflict');
    if (firstConflict) {
      firstConflict.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  App.conflicts = { checkForConflicts, highlightConflicts };
})(window.App);
