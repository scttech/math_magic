import '../app/init.js';
import { renderNav } from '../app/nav.js';
import { listLessons } from '../core/lessons.js';
import { topicLabel } from '../app/topicLabels.js';
import { getActiveProfileId } from '../core/profileStore.js';
import { getLessonStatus } from '../core/lessonProgress.js';
import { renderLessonRoadmap } from '../app/lessonRoadmap.js';

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

/** Groups lessons by grade + topic, in the order they're declared (that order is the intended learning path). */
function groupLessons(lessons) {
  const groups = [];
  const byKey = new Map();
  for (const lesson of lessons) {
    const key = `${lesson.grade}:${lesson.topic}`;
    if (!byKey.has(key)) {
      const group = { grade: lesson.grade, topic: lesson.topic, lessons: [] };
      byKey.set(key, group);
      groups.push(group);
    }
    byKey.get(key).lessons.push(lesson);
  }
  return groups;
}

function renderLessonGroups() {
  const container = document.getElementById('lesson-groups');
  const lessons = listLessons();

  if (lessons.length === 0) {
    container.innerHTML = '<p class="progress-text">No lessons are available yet — check back soon.</p>';
    return;
  }

  const profileId = getActiveProfileId();
  container.innerHTML = '';

  for (const group of groupLessons(lessons)) {
    const section = document.createElement('section');
    section.className = 'lesson-roadmap-group';
    section.innerHTML = `<h2>Grade ${escapeHtml(group.grade)} — ${escapeHtml(topicLabel(group.topic))}</h2>`;
    const roadmapContainer = document.createElement('div');
    section.appendChild(roadmapContainer);
    container.appendChild(section);

    const entries = group.lessons.map((lesson) => ({ lesson, status: getLessonStatus(profileId, lesson) }));
    renderLessonRoadmap(roadmapContainer, entries);
  }
}

export function init() {
  renderNav('learn.html');
  renderLessonGroups();
}
