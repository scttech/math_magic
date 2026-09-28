// Pure aggregation functions over a profile's progress document
// ({attempts, worksheets}). No DOM, no storage — data in, data out — so
// they're easy to unit test and reusable anywhere progress needs summarizing.
import { getById } from './registry.js';

function topicOf(generatorId) {
  const generator = getById(generatorId);
  return generator ? generator.topic : 'unknown';
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
