// Picks a single topic for the home page's "Recommended Practice" card: the
// topic the student has gotten wrong most often, among topics with enough
// recorded problems that the accuracy means something (so one early miss
// doesn't dominate the recommendation). Resolves to the right page to
// practice it on — quiz.html for a curriculum topic, or that skill's own
// page for a grade-agnostic skill drill (which has no "grade" of its own).
import { computeAccuracyByTopic } from '../core/scoring.js';
import { topicLabel } from './topicLabels.js';

const MIN_SAMPLE_SIZE = 3;

// Only ever rendered on index.html, so URLs are rooted under pages/.
const SKILL_PAGES = {
  multiplicationTables: 'pages/skills-multiplication-tables.html',
  shapeIdentification: 'pages/skills-shape-identification.html',
  additionFacts: 'pages/skills-addition-facts.html',
  subtractionFacts: 'pages/skills-subtraction-facts.html',
  divisionFacts: 'pages/skills-division-facts.html',
};

/** The grade of the most recent attempt that practiced this topic (null for a skill drill, which has no grade). */
function findGradeForTopic(progress, topic) {
  for (let i = progress.attempts.length - 1; i >= 0; i--) {
    const attempt = progress.attempts[i];
    if (attempt.topics && attempt.topics.includes(topic)) return attempt.grade;
  }
  return null;
}

/**
 * Returns { topic, label, accuracy, total, url } for the topic most worth
 * practicing next, or null if there isn't enough data yet (no attempts, or
 * every topic has fewer than a handful of recorded problems).
 */
export function getRecommendedPractice(progress) {
  if (!progress || progress.attempts.length === 0) return null;

  const byTopic = computeAccuracyByTopic(progress).filter((t) => t.total >= MIN_SAMPLE_SIZE);
  if (byTopic.length === 0) return null;

  const weakest = byTopic[0];
  const grade = findGradeForTopic(progress, weakest.topic);
  const url = grade
    ? `pages/quiz.html?grade=${encodeURIComponent(grade)}&topic=${encodeURIComponent(weakest.topic)}`
    : SKILL_PAGES[weakest.topic] || 'pages/skills.html';

  return { topic: weakest.topic, label: topicLabel(weakest.topic), accuracy: weakest.accuracy, total: weakest.total, url };
}
