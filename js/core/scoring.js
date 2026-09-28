// Pure aggregation functions over a profile's progress document
// ({attempts, worksheets}). No DOM, no storage — data in, data out — so
// they're easy to unit test and reusable anywhere progress needs summarizing.
import { getById } from './registry.js';

// Falls back to the generatorId's last dot-segment for ids outside the
// grade/topic registry (e.g. "skills.multiplicationTables" -> "multiplicationTables"),
// so grade-agnostic skill drills still bucket sensibly instead of showing "unknown".
function topicOf(generatorId) {
  const generator = getById(generatorId);
  if (generator) return generator.topic;
  const lastSegment = String(generatorId).split('.').pop();
  return lastSegment || 'unknown';
}

/** Accuracy per topic across all recorded attempts, sorted weakest-first. */
export function computeAccuracyByTopic(progressData) {
  const byTopic = new Map();
  for (const attempt of progressData.attempts) {
    for (const problem of attempt.problems) {
      const topic = topicOf(problem.generatorId);
      const entry = byTopic.get(topic) || { topic, correct: 0, total: 0 };
      entry.total += 1;
      if (problem.correct) entry.correct += 1;
      byTopic.set(topic, entry);
    }
  }
  return Array.from(byTopic.values())
    .map((entry) => ({ ...entry, accuracy: entry.total === 0 ? 0 : entry.correct / entry.total }))
    .sort((a, b) => a.accuracy - b.accuracy);
}

function startOfWeek(isoString) {
  const d = new Date(isoString);
  const day = d.getUTCDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + mondayOffset);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Accuracy over time, bucketed by week, optionally scoped to one topic.
 * Returns entries sorted chronologically: { bucketStart (YYYY-MM-DD), correct, total, accuracy }.
 */
export function computeAccuracyTrend(progressData, { topic = null } = {}) {
  const buckets = new Map();
  for (const attempt of progressData.attempts) {
    if (!attempt.completedAt) continue;
    const key = startOfWeek(attempt.completedAt).toISOString().slice(0, 10);
    const entry = buckets.get(key) || { bucketStart: key, correct: 0, total: 0 };
    for (const problem of attempt.problems) {
      if (topic && topicOf(problem.generatorId) !== topic) continue;
      entry.total += 1;
      if (problem.correct) entry.correct += 1;
    }
    buckets.set(key, entry);
  }
  return Array.from(buckets.values())
    .filter((entry) => entry.total > 0)
    .map((entry) => ({ ...entry, accuracy: entry.correct / entry.total }))
    .sort((a, b) => a.bucketStart.localeCompare(b.bucketStart));
}

/** Overall summary stats across every attempt/worksheet, for the dashboard's stat tiles. */
export function computeSummary(progressData) {
  const totalAttempts = progressData.attempts.length;
  let totalProblems = 0;
  let totalCorrect = 0;
  for (const attempt of progressData.attempts) {
    totalProblems += attempt.problems.length;
    totalCorrect += attempt.problems.filter((p) => p.correct).length;
  }
  return {
    totalAttempts,
    totalProblems,
    totalCorrect,
    overallAccuracy: totalProblems === 0 ? 0 : totalCorrect / totalProblems,
    totalWorksheets: progressData.worksheets.length,
  };
}

/**
 * Current daily-practice streak: consecutive calendar days with at least one
 * attempt, ending today. If today has no attempt yet but yesterday does, the
 * streak still counts (a one-day grace period) so it doesn't look broken
 * before the day is over.
 */
export function computeStreak(progressData, referenceDate = new Date()) {
  const days = new Set(progressData.attempts.filter((a) => a.completedAt).map((a) => a.completedAt.slice(0, 10)));
  if (days.size === 0) return 0;

  const cursor = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), referenceDate.getUTCDate()));
  if (!days.has(cursor.toISOString().slice(0, 10))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

// A short, fixed list — not a badge engine. Each rule reads the same summary
// stats + streak every caller already has, so adding one is a one-line diff.
const BADGE_DEFINITIONS = [
  { id: 'first-quiz', label: 'First Quiz', check: (summary) => summary.totalAttempts >= 1 },
  { id: 'five-quizzes', label: '5 Quizzes Completed', check: (summary) => summary.totalAttempts >= 5 },
  { id: 'fifty-problems', label: '50 Problems Answered', check: (summary) => summary.totalProblems >= 50 },
  {
    id: 'perfect-quiz',
    label: 'Perfect Quiz',
    check: (summary, progressData) => progressData.attempts.some((a) => a.problems.length > 0 && a.problems.every((p) => p.correct)),
  },
  { id: 'week-streak', label: '7-Day Streak', check: (summary, progressData, streak) => streak >= 7 },
];

/** Which of a small, fixed set of badges a profile has earned. */
export function computeBadges(progressData) {
  const summary = computeSummary(progressData);
  const streak = computeStreak(progressData);
  return BADGE_DEFINITIONS.map((badge) => ({ id: badge.id, label: badge.label, earned: badge.check(summary, progressData, streak) }));
}
