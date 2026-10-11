import '../app/init.js';
import { renderNav } from '../app/nav.js';
import { listGradesWithLessons, listTopicsForGrade, getLessonsForTopic } from '../core/lessons.js';
import { topicLabel } from '../app/topicLabels.js';
import { getActiveProfileId } from '../core/profileStore.js';
import { getTopicStatus } from '../core/lessonProgress.js';
import { renderRoadmap } from '../app/lessonRoadmap.js';

const els = {};

function cacheElements() {
  els.gradeSelect = document.getElementById('grade-select');
  els.container = document.getElementById('topic-roadmap-container');
}

function populateGradeSelect() {
  const grades = listGradesWithLessons();
  els.gradeSelect.innerHTML = grades.map((g) => `<option value="${g}">Grade ${g}</option>`).join('');
}

function renderTopicRoadmap() {
  const grade = els.gradeSelect.value;
  const topics = listTopicsForGrade(grade);

  if (topics.length === 0) {
    els.container.innerHTML = `<p class="progress-text">No lessons yet for Grade ${grade} — check back soon.</p>`;
    return;
  }

  const profileId = getActiveProfileId();
  const nodes = topics.map((topic) => ({
    title: topicLabel(topic),
    status: getTopicStatus(profileId, getLessonsForTopic(grade, topic)),
    href: `learn-topic.html?grade=${encodeURIComponent(grade)}&topic=${encodeURIComponent(topic)}`,
  }));
  renderRoadmap(els.container, nodes);
}

export function init() {
  cacheElements();
  renderNav('learn.html');
  populateGradeSelect();
  renderTopicRoadmap();
  els.gradeSelect.addEventListener('change', renderTopicRoadmap);
}
