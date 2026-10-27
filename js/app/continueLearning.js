// Picks which lesson the home page's "Learn" card should point at: the first
// lesson (in curriculum order) that's in progress, or else the first one not
// yet started — so a returning student lands on the next sensible lesson
// instead of always the very first one in the catalog. Only ever rendered on
// index.html, so the URL is rooted under pages/.
import { listLessons } from '../core/lessons.js';
import { getLessonStatus } from '../core/lessonProgress.js';

function lessonUrl(lesson) {
  return `pages/lesson.html?id=${encodeURIComponent(lesson.id)}`;
}

/** @returns {{lesson: Object, status: 'in-progress'|'not-started', url: string}|null} null once every lesson is completed. */
export function getContinueLearning(profileId) {
  if (!profileId) return null;

  let firstNotStarted = null;
  for (const lesson of listLessons()) {
    const status = getLessonStatus(profileId, lesson);
    if (status === 'in-progress') return { lesson, status, url: lessonUrl(lesson) };
    if (status === 'not-started' && !firstNotStarted) firstNotStarted = lesson;
  }
  return firstNotStarted ? { lesson: firstNotStarted, status: 'not-started', url: lessonUrl(firstNotStarted) } : null;
}
