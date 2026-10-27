import '../../js/generators/grade6/index.js';
import { computeAccuracyByTopic, computeAccuracyTrend, computeSummary, computeStreak, computeBadges, computeDuelStats, filterAttemptsSince } from '../../js/core/scoring.js';

function attempt({ completedAt, problems }) {
  return { attemptId: 'a', type: 'quiz', grade: '6', topics: [], difficulty: 'medium', startedAt: completedAt, completedAt, problems };
}

function duelAttempt({ completedAt, outcome, opponentScore = 0 }) {
  return { attemptId: 'd', type: 'duel', topics: ['additionFacts'], startedAt: completedAt, completedAt, problems: [], outcome, opponentScore, rounds: 10 };
}

function problem(generatorId, correct) {
  return { generatorId, difficulty: 'medium', seed: 1, correct, userAnswer: '', timeMs: 100 };
}

const FRACTIONS_GEN = 'grade6.fractionsDecimals.addSubtractFractions';
const RATIOS_GEN = 'grade6.ratiosProportions.simplifyRatio';

QUnit.module('core/scoring', () => {
  QUnit.test('computeAccuracyByTopic aggregates across attempts and sorts weakest first', (assert) => {
    const progress = {
      schemaVersion: 1,
      worksheets: [],
      attempts: [
        attempt({ completedAt: '2026-01-01T00:00:00.000Z', problems: [problem(FRACTIONS_GEN, true), problem(FRACTIONS_GEN, true), problem(RATIOS_GEN, false)] }),
        attempt({ completedAt: '2026-01-02T00:00:00.000Z', problems: [problem(FRACTIONS_GEN, false), problem(RATIOS_GEN, false)] }),
      ],
    };

    const result = computeAccuracyByTopic(progress);
    const ratios = result.find((r) => r.topic === 'ratiosProportions');
    const fractions = result.find((r) => r.topic === 'fractionsDecimals');

    assert.equal(ratios.correct, 0);
    assert.equal(ratios.total, 2);
    assert.equal(ratios.accuracy, 0);

    assert.equal(fractions.correct, 2);
    assert.equal(fractions.total, 3);
    assert.ok(Math.abs(fractions.accuracy - 2 / 3) < 1e-9);

    assert.equal(result[0].topic, 'ratiosProportions', 'weakest topic (0% accuracy) sorts first');
  });

  QUnit.test('computeAccuracyByTopic returns an empty array for no attempts', (assert) => {
    assert.deepEqual(computeAccuracyByTopic({ attempts: [], worksheets: [] }), []);
  });

  QUnit.test('computeAccuracyByTopic buckets an unregistered generatorId (e.g. a skill drill) by its last dot-segment', (assert) => {
    const progress = {
      schemaVersion: 1,
      worksheets: [],
      attempts: [attempt({ completedAt: '2026-01-01T00:00:00.000Z', problems: [problem('skills.multiplicationTables', true), problem('skills.multiplicationTables', false)] })],
    };
    const result = computeAccuracyByTopic(progress);
    const skillEntry = result.find((r) => r.topic === 'multiplicationTables');
    assert.ok(skillEntry, 'an unregistered generatorId still produces a labeled bucket, not "unknown"');
    assert.equal(skillEntry.correct, 1);
    assert.equal(skillEntry.total, 2);
  });

  QUnit.test('computeAccuracyTrend buckets attempts by week and sorts chronologically', (assert) => {
    const progress = {
      schemaVersion: 1,
      worksheets: [],
      attempts: [
        // 2026-01-05 is a Monday; 2026-01-06 falls in the same week bucket.
        attempt({ completedAt: '2026-01-05T00:00:00.000Z', problems: [problem(FRACTIONS_GEN, true)] }),
        attempt({ completedAt: '2026-01-06T00:00:00.000Z', problems: [problem(FRACTIONS_GEN, false)] }),
        // The following Monday is a new bucket.
        attempt({ completedAt: '2026-01-12T00:00:00.000Z', problems: [problem(FRACTIONS_GEN, true), problem(FRACTIONS_GEN, true)] }),
      ],
    };

    const trend = computeAccuracyTrend(progress);
    assert.equal(trend.length, 2);
    assert.equal(trend[0].bucketStart, '2026-01-05');
    assert.equal(trend[0].correct, 1);
    assert.equal(trend[0].total, 2);
    assert.equal(trend[1].bucketStart, '2026-01-12');
    assert.equal(trend[1].correct, 2);
    assert.equal(trend[1].total, 2);
    assert.ok(trend[0].bucketStart < trend[1].bucketStart, 'sorted chronologically');
  });

  QUnit.test('computeAccuracyTrend can be scoped to a single topic', (assert) => {
    const progress = {
      schemaVersion: 1,
      worksheets: [],
      attempts: [attempt({ completedAt: '2026-01-05T00:00:00.000Z', problems: [problem(FRACTIONS_GEN, true), problem(RATIOS_GEN, false)] })],
    };

    const trend = computeAccuracyTrend(progress, { topic: 'ratiosProportions' });
    assert.equal(trend.length, 1);
    assert.equal(trend[0].total, 1);
    assert.equal(trend[0].correct, 0);
  });

  QUnit.test('computeAccuracyTrend omits buckets with zero matching problems after a topic filter', (assert) => {
    const progress = {
      schemaVersion: 1,
      worksheets: [],
      attempts: [attempt({ completedAt: '2026-01-05T00:00:00.000Z', problems: [problem(FRACTIONS_GEN, true)] })],
    };
    assert.deepEqual(computeAccuracyTrend(progress, { topic: 'ratiosProportions' }), []);
  });

  QUnit.test('computeSummary totals attempts, problems, correctness, and worksheets', (assert) => {
    const progress = {
      schemaVersion: 1,
      worksheets: [{ worksheetId: 'w1' }, { worksheetId: 'w2' }],
      attempts: [attempt({ completedAt: '2026-01-01T00:00:00.000Z', problems: [problem(FRACTIONS_GEN, true), problem(FRACTIONS_GEN, false)] })],
    };
    const summary = computeSummary(progress);
    assert.equal(summary.totalAttempts, 1);
    assert.equal(summary.totalProblems, 2);
    assert.equal(summary.totalCorrect, 1);
    assert.equal(summary.overallAccuracy, 0.5);
    assert.equal(summary.totalWorksheets, 2);
  });

  QUnit.test('computeSummary handles no attempts without dividing by zero', (assert) => {
    const summary = computeSummary({ attempts: [], worksheets: [] });
    assert.equal(summary.overallAccuracy, 0);
  });

  QUnit.test('computeStreak is 0 with no attempts', (assert) => {
    assert.equal(computeStreak({ attempts: [], worksheets: [] }), 0);
  });

  QUnit.test('computeStreak counts consecutive days ending today', (assert) => {
    const reference = new Date('2026-01-10T12:00:00.000Z');
    const progress = {
      schemaVersion: 1,
      worksheets: [],
      attempts: [
        attempt({ completedAt: '2026-01-08T09:00:00.000Z', problems: [problem(FRACTIONS_GEN, true)] }),
        attempt({ completedAt: '2026-01-09T09:00:00.000Z', problems: [problem(FRACTIONS_GEN, true)] }),
        attempt({ completedAt: '2026-01-10T09:00:00.000Z', problems: [problem(FRACTIONS_GEN, true)] }),
      ],
    };
    assert.equal(computeStreak(progress, reference), 3);
  });

  QUnit.test('computeStreak grants a one-day grace period when today has no attempt yet', (assert) => {
    const reference = new Date('2026-01-10T23:00:00.000Z');
    const progress = {
      schemaVersion: 1,
      worksheets: [],
      attempts: [attempt({ completedAt: '2026-01-09T09:00:00.000Z', problems: [problem(FRACTIONS_GEN, true)] })],
    };
    assert.equal(computeStreak(progress, reference), 1);
  });

  QUnit.test('computeStreak is 0 once both today and yesterday are missing', (assert) => {
    const reference = new Date('2026-01-10T12:00:00.000Z');
    const progress = {
      schemaVersion: 1,
      worksheets: [],
      attempts: [attempt({ completedAt: '2026-01-05T09:00:00.000Z', problems: [problem(FRACTIONS_GEN, true)] })],
    };
    assert.equal(computeStreak(progress, reference), 0);
  });

  QUnit.test('computeStreak stops at the first gap', (assert) => {
    const reference = new Date('2026-01-10T12:00:00.000Z');
    const progress = {
      schemaVersion: 1,
      worksheets: [],
      attempts: [
        attempt({ completedAt: '2026-01-10T09:00:00.000Z', problems: [problem(FRACTIONS_GEN, true)] }),
        attempt({ completedAt: '2026-01-09T09:00:00.000Z', problems: [problem(FRACTIONS_GEN, true)] }),
        // gap on Jan 8
        attempt({ completedAt: '2026-01-07T09:00:00.000Z', problems: [problem(FRACTIONS_GEN, true)] }),
      ],
    };
    assert.equal(computeStreak(progress, reference), 2);
  });

  QUnit.test('computeBadges returns earned:false for every badge with no attempts', (assert) => {
    const badges = computeBadges({ attempts: [], worksheets: [] });
    assert.ok(badges.length > 0);
    assert.ok(badges.every((b) => b.earned === false));
  });

  QUnit.test('computeBadges marks "First Quiz" earned after one attempt', (assert) => {
    const progress = {
      schemaVersion: 1,
      worksheets: [],
      attempts: [attempt({ completedAt: '2026-01-01T00:00:00.000Z', problems: [problem(FRACTIONS_GEN, true)] })],
    };
    const badges = computeBadges(progress);
    assert.ok(badges.find((b) => b.id === 'first-quiz').earned);
    assert.notOk(badges.find((b) => b.id === 'five-quizzes').earned);
  });

  QUnit.test('computeBadges marks "Perfect Quiz" earned only when every problem in some attempt is correct', (assert) => {
    const notPerfect = {
      schemaVersion: 1,
      worksheets: [],
      attempts: [attempt({ completedAt: '2026-01-01T00:00:00.000Z', problems: [problem(FRACTIONS_GEN, true), problem(FRACTIONS_GEN, false)] })],
    };
    assert.notOk(computeBadges(notPerfect).find((b) => b.id === 'perfect-quiz').earned);

    const perfect = {
      schemaVersion: 1,
      worksheets: [],
      attempts: [attempt({ completedAt: '2026-01-01T00:00:00.000Z', problems: [problem(FRACTIONS_GEN, true), problem(FRACTIONS_GEN, true)] })],
    };
    assert.ok(computeBadges(perfect).find((b) => b.id === 'perfect-quiz').earned);
  });

  QUnit.test('computeDuelStats is all zero with no duel attempts', (assert) => {
    assert.deepEqual(computeDuelStats({ attempts: [], worksheets: [] }), { total: 0, wins: 0, losses: 0, ties: 0, currentWinStreak: 0, shutouts: 0 });
  });

  QUnit.test('computeDuelStats tallies wins/losses/ties and ignores non-duel attempts', (assert) => {
    const progress = {
      schemaVersion: 1,
      worksheets: [],
      attempts: [
        attempt({ completedAt: '2026-01-01T00:00:00.000Z', problems: [problem(FRACTIONS_GEN, true)] }),
        duelAttempt({ completedAt: '2026-01-02T00:00:00.000Z', outcome: 'win', opponentScore: 3 }),
        duelAttempt({ completedAt: '2026-01-03T00:00:00.000Z', outcome: 'loss' }),
        duelAttempt({ completedAt: '2026-01-04T00:00:00.000Z', outcome: 'tie' }),
      ],
    };
    const stats = computeDuelStats(progress);
    assert.equal(stats.total, 3);
    assert.equal(stats.wins, 1);
    assert.equal(stats.losses, 1);
    assert.equal(stats.ties, 1);
  });

  QUnit.test('computeDuelStats counts the current win streak back from the most recent duel', (assert) => {
    const progress = {
      schemaVersion: 1,
      worksheets: [],
      attempts: [
        duelAttempt({ completedAt: '2026-01-01T00:00:00.000Z', outcome: 'loss' }),
        duelAttempt({ completedAt: '2026-01-02T00:00:00.000Z', outcome: 'win' }),
        duelAttempt({ completedAt: '2026-01-03T00:00:00.000Z', outcome: 'win' }),
        duelAttempt({ completedAt: '2026-01-04T00:00:00.000Z', outcome: 'win' }),
      ],
    };
    assert.equal(computeDuelStats(progress).currentWinStreak, 3);
  });

  QUnit.test('computeDuelStats resets the win streak to 0 after a loss or tie', (assert) => {
    const progress = {
      schemaVersion: 1,
      worksheets: [],
      attempts: [duelAttempt({ completedAt: '2026-01-01T00:00:00.000Z', outcome: 'win' }), duelAttempt({ completedAt: '2026-01-02T00:00:00.000Z', outcome: 'tie' })],
    };
    assert.equal(computeDuelStats(progress).currentWinStreak, 0);
  });

  QUnit.test('computeDuelStats counts a shutout only on a win with opponentScore 0', (assert) => {
    const shutout = { schemaVersion: 1, worksheets: [], attempts: [duelAttempt({ completedAt: '2026-01-01T00:00:00.000Z', outcome: 'win', opponentScore: 0 })] };
    const closeWin = { schemaVersion: 1, worksheets: [], attempts: [duelAttempt({ completedAt: '2026-01-01T00:00:00.000Z', outcome: 'win', opponentScore: 2 })] };
    assert.equal(computeDuelStats(shutout).shutouts, 1);
    assert.equal(computeDuelStats(closeWin).shutouts, 0);
  });

  QUnit.test('computeBadges marks duel badges earned based on computeDuelStats', (assert) => {
    const noDuels = computeBadges({ attempts: [], worksheets: [] });
    assert.notOk(noDuels.find((b) => b.id === 'first-duel').earned);

    const progress = {
      schemaVersion: 1,
      worksheets: [],
      attempts: [
        duelAttempt({ completedAt: '2026-01-01T00:00:00.000Z', outcome: 'win', opponentScore: 0 }),
        duelAttempt({ completedAt: '2026-01-02T00:00:00.000Z', outcome: 'win', opponentScore: 1 }),
        duelAttempt({ completedAt: '2026-01-03T00:00:00.000Z', outcome: 'win', opponentScore: 2 }),
      ],
    };
    const badges = computeBadges(progress);
    assert.ok(badges.find((b) => b.id === 'first-duel').earned);
    assert.ok(badges.find((b) => b.id === 'duel-streak').earned, '3-win streak reached');
    assert.ok(badges.find((b) => b.id === 'duel-shutout').earned, 'first duel win was a shutout');
    assert.notOk(badges.find((b) => b.id === 'duel-champion').earned, 'only 3 of the required 5 wins so far');
  });

  QUnit.test('filterAttemptsSince keeps only attempts completed at or after the given date', (assert) => {
    const progress = {
      schemaVersion: 1,
      worksheets: [{ worksheetId: 'w1' }],
      attempts: [
        attempt({ completedAt: '2026-01-01T00:00:00.000Z', problems: [problem(FRACTIONS_GEN, true)] }),
        attempt({ completedAt: '2026-01-10T00:00:00.000Z', problems: [problem(FRACTIONS_GEN, true)] }),
        attempt({ completedAt: '2026-01-15T00:00:00.000Z', problems: [problem(FRACTIONS_GEN, false)] }),
      ],
    };
    const filtered = filterAttemptsSince(progress, new Date('2026-01-10T00:00:00.000Z'));
    assert.equal(filtered.attempts.length, 2, 'the boundary date itself is included');
    assert.deepEqual(
      filtered.attempts.map((a) => a.completedAt),
      ['2026-01-10T00:00:00.000Z', '2026-01-15T00:00:00.000Z']
    );
    assert.deepEqual(filtered.worksheets, progress.worksheets, 'other fields pass through unchanged');
  });

  QUnit.test('filterAttemptsSince accepts a plain date string as well as a Date', (assert) => {
    const progress = {
      schemaVersion: 1,
      worksheets: [],
      attempts: [attempt({ completedAt: '2026-01-01T00:00:00.000Z', problems: [problem(FRACTIONS_GEN, true)] })],
    };
    assert.equal(filterAttemptsSince(progress, '2026-01-05T00:00:00.000Z').attempts.length, 0);
    assert.equal(filterAttemptsSince(progress, '2025-12-25T00:00:00.000Z').attempts.length, 1);
  });

  QUnit.test('filterAttemptsSince can be fed straight into computeSummary/computeAccuracyByTopic', (assert) => {
    const progress = {
      schemaVersion: 1,
      worksheets: [],
      attempts: [
        attempt({ completedAt: '2026-01-01T00:00:00.000Z', problems: [problem(FRACTIONS_GEN, true), problem(FRACTIONS_GEN, true)] }),
        attempt({ completedAt: '2026-01-20T00:00:00.000Z', problems: [problem(RATIOS_GEN, false)] }),
      ],
    };
    const windowed = filterAttemptsSince(progress, new Date('2026-01-15T00:00:00.000Z'));
    assert.equal(computeSummary(windowed).totalProblems, 1);
    assert.deepEqual(
      computeAccuracyByTopic(windowed).map((t) => t.topic),
      ['ratiosProportions']
    );
  });
});
