import '../../js/generators/grade6/index.js';
import { computeAccuracyByTopic, computeAccuracyTrend, computeSummary } from '../../js/core/scoring.js';

function attempt({ completedAt, problems }) {
  return { attemptId: 'a', type: 'quiz', grade: '6', topics: [], difficulty: 'medium', startedAt: completedAt, completedAt, problems };
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
});
