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

/**
 * A shallow copy of progressData with only attempts completed at or after
 * `sinceDate` — feed the result straight into computeSummary/
 * computeAccuracyByTopic/computeStreak/computeBadges to get those same
 * aggregations scoped to a date window (e.g. a weekly report), with no
 * separate windowed versions of any of them needed.
 */
export function filterAttemptsSince(progressData, sinceDate) {
  const since = sinceDate instanceof Date ? sinceDate : new Date(sinceDate);
  return {
    ...progressData,
    attempts: progressData.attempts.filter((a) => a.completedAt && new Date(a.completedAt) >= since),
  };
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

/**
 * Duel Mode win/loss record, derived entirely from `type: 'duel'` attempts
 * (each carrying an `outcome` of 'win'/'loss'/'tie' and, on a win, the
 * opponent's final score) — no separate stored tally to keep in sync.
 */
export function computeDuelStats(progressData) {
  const duels = progressData.attempts.filter((a) => a.type === 'duel');
  const wins = duels.filter((d) => d.outcome === 'win').length;
  const losses = duels.filter((d) => d.outcome === 'loss').length;
  const ties = duels.filter((d) => d.outcome === 'tie').length;

  let currentWinStreak = 0;
  for (let i = duels.length - 1; i >= 0; i -= 1) {
    if (duels[i].outcome !== 'win') break;
    currentWinStreak += 1;
  }

  const shutouts = duels.filter((d) => d.outcome === 'win' && d.opponentScore === 0).length;

  return { total: duels.length, wins, losses, ties, currentWinStreak, shutouts };
}

// A short, fixed list — not a badge engine. Each rule reads the same summary
// stats + streak (+ duel stats) every caller already has, so adding one is a
// one-line diff.
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
  { id: 'first-duel', label: 'First Duel', check: (summary, progressData, streak, duelStats) => duelStats.total >= 1 },
  { id: 'duel-champion', label: 'Duel Champion (5 Wins)', check: (summary, progressData, streak, duelStats) => duelStats.wins >= 5 },
  { id: 'duel-streak', label: '3-Win Duel Streak', check: (summary, progressData, streak, duelStats) => duelStats.currentWinStreak >= 3 },
  { id: 'duel-shutout', label: 'Flawless Victory', check: (summary, progressData, streak, duelStats) => duelStats.shutouts >= 1 },
];

/** Which of a small, fixed set of badges a profile has earned. */
export function computeBadges(progressData) {
  const summary = computeSummary(progressData);
  const streak = computeStreak(progressData);
  const duelStats = computeDuelStats(progressData);
  return BADGE_DEFINITIONS.map((badge) => ({ id: badge.id, label: badge.label, earned: badge.check(summary, progressData, streak, duelStats) }));
}
