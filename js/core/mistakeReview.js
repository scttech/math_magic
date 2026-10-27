// Review Mistakes: surfaces every wrong answer across a profile's history
// (quiz, lessons' checkpoints are excluded — they're not recorded as
// attempts — skill drills, and games) so a student can drill just the
// problems they've actually missed instead of starting a whole new session.
//
// A problem is only reviewable if there's enough stored on it to show again:
// either its generatorId resolves in the grade/topic registry (quiz,
// Treasure Hunt) — in which case the exact original problem can be
// regenerated from (generatorId, difficulty, seed), full fidelity including
// its visual and real checkAnswer() — or it carries its own display snapshot
// (promptText/answerDisplay/choices, stored at record time by the
// grade-agnostic skill/game views, which live outside that registry). Memory
// Match's "mismatch" results have neither (there's no single right answer to
// drill) and are naturally excluded rather than special-cased by name.
import { getById } from './registry.js';
import { getProgress, setProgress } from './progressStore.js';

/** Identifies one specific problem instance, stable across attempts. */
export function mistakeKey(problem) {
  return `${problem.generatorId}::${problem.difficulty ?? ''}::${problem.seed}`;
}

function isReviewable(problem) {
  return Boolean(getById(problem.generatorId)) || Boolean(problem.promptText);
}

/**
 * Every currently-unresolved wrong answer in a profile's history, most
 * recently missed first, deduplicated by mistakeKey() so a problem instance
 * missed more than once is only queued once.
 */
export function collectMistakes(progressData, { limit = 20 } = {}) {
  const resolved = progressData.resolvedMistakes || {};
  const byKey = new Map();
  for (const attempt of progressData.attempts) {
    for (const problem of attempt.problems) {
      if (problem.correct || !isReviewable(problem)) continue;
      const key = mistakeKey(problem);
      if (resolved[key]) continue;
      byKey.set(key, { ...problem, key, topics: attempt.topics || [], missedAt: attempt.completedAt || '' });
    }
  }
  return Array.from(byKey.values())
    .sort((a, b) => b.missedAt.localeCompare(a.missedAt))
    .slice(0, limit);
}

/** Counts reviewable mistakes per topic, for a short "what's queued" summary. */
export function groupMistakesByTopic(mistakes) {
  const counts = new Map();
  for (const mistake of mistakes) {
    for (const topic of mistake.topics.length > 0 ? mistake.topics : ['unknown']) {
      counts.set(topic, (counts.get(topic) || 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);
}

/** Marks a problem instance as resolved so it stops appearing in collectMistakes(). Idempotent. */
export function markMistakeResolved(profileId, key) {
  const doc = getProgress(profileId);
  if (!doc.resolvedMistakes[key]) {
    doc.resolvedMistakes = { ...doc.resolvedMistakes, [key]: true };
    setProgress(profileId, doc);
  }
}
