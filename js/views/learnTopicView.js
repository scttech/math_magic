import '../app/init.js';
import { renderNav } from '../app/nav.js';
import { getLessonsForTopic } from '../core/lessons.js';
import { topicLabel } from '../app/topicLabels.js';
import { getActiveProfileId } from '../core/profileStore.js';
import { getLessonStatus } from '../core/lessonProgress.js';
import { renderRoadmap } from '../app/lessonRoadmap.js';

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

export function init() {
  renderNav('learn.html');

  const params = new URLSearchParams(window.location.search);
  const grade = params.get('grade');
  const topic = params.get('topic');
  const lessons = grade && topic ? getLessonsForTopic(grade, topic) : [];

  if (lessons.length === 0) {
    document.getElementById('lesson-roadmap-container').hidden = true;
    document.getElementById('topic-not-found').hidden = false;
    return;
  }

  const title = `Grade ${grade} — ${topicLabel(topic)}`;
  document.title = `Math Magic — ${topicLabel(topic)}`;
  document.getElementById('topic-title').innerHTML = escapeHtml(title);

  const profileId = getActiveProfileId();
  const nodes = lessons.map((lesson) => ({
    title: lesson.title,
    status: getLessonStatus(profileId, lesson),
    href: `lesson.html?id=${encodeURIComponent(lesson.id)}`,
  }));
  renderRoadmap(document.getElementById('lesson-roadmap-container'), nodes);
}
