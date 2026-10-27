import { register } from '../../js/core/registry.js';
import { getProgress } from '../../js/core/progressStore.js';
import { mistakeKey, collectMistakes, groupMistakesByTopic, markMistakeResolved } from '../../js/core/mistakeReview.js';

// A fake registry module so "registry-resolvable" mistakes can be exercised
// without touching real grade-6 content (see registry.test.js's own note).
const TEST_GENERATOR_ID = 'test.mistakeReview.registryGenerator';
register({ id: TEST_GENERATOR_ID, grade: '99-mistake-review-test', topic: 'fake-topic' });

function emptyProgress(overrides = {}) {
  return { schemaVersion: 3, attempts: [], worksheets: [], lessons: {}, resolvedMistakes: {}, ...overrides };
}

QUnit.module('core/mistakeReview', (hooks) => {
  hooks.beforeEach(() => localStorage.clear());

  QUnit.test('mistakeKey combines generatorId, difficulty, and seed', (assert) => {
    assert.equal(mistakeKey({ generatorId: 'a', difficulty: 'easy', seed: 5 }), 'a::easy::5');
    assert.equal(mistakeKey({ generatorId: 'a', difficulty: null, seed: 5 }), 'a::::5');
  });

  QUnit.test('collectMistakes finds a wrong registry-resolvable problem even without a stored promptText', (assert) => {
    const progress = emptyProgress({
      attempts: [
        {
          completedAt: '2026-01-01T00:00:00.000Z',
          topics: ['fake-topic'],
          problems: [{ generatorId: TEST_GENERATOR_ID, difficulty: 'easy', seed: 1, correct: false, userAnswer: '2' }],
        },
      ],
    });
    const mistakes = collectMistakes(progress);
    assert.equal(mistakes.length, 1);
    assert.equal(mistakes[0].generatorId, TEST_GENERATOR_ID);
  });

  QUnit.test('collectMistakes finds a wrong skill/game problem via its stored promptText snapshot', (assert) => {
    const progress = emptyProgress({
      attempts: [
        {
          completedAt: '2026-01-01T00:00:00.000Z',
          topics: ['additionFacts'],
          problems: [
            { generatorId: 'skills.additionFacts', difficulty: null, seed: 1, correct: false, userAnswer: '5', promptText: '2 + 2', answerDisplay: '4', choices: ['4', '5'] },
          ],
        },
      ],
    });
    const mistakes = collectMistakes(progress);
    assert.equal(mistakes.length, 1);
    assert.equal(mistakes[0].promptText, '2 + 2');
  });

  QUnit.test('collectMistakes skips a result with neither a registry id nor a promptText (e.g. Memory Match)', (assert) => {
    const progress = emptyProgress({
      attempts: [
        {
          completedAt: '2026-01-01T00:00:00.000Z',
          topics: ['additionFacts'],
          problems: [{ generatorId: 'skills.additionFacts', difficulty: null, seed: 1, correct: false, userAnswer: '2 + 2 / 3 + 1' }],
        },
      ],
    });
    assert.equal(collectMistakes(progress).length, 0);
  });

  QUnit.test('collectMistakes skips correctly-answered problems', (assert) => {
    const progress = emptyProgress({
      attempts: [
        {
          completedAt: '2026-01-01T00:00:00.000Z',
          topics: ['fake-topic'],
          problems: [{ generatorId: TEST_GENERATOR_ID, difficulty: 'easy', seed: 1, correct: true }],
        },
      ],
    });
    assert.equal(collectMistakes(progress).length, 0);
  });

  QUnit.test('collectMistakes excludes mistakes already marked resolved', (assert) => {
    const progress = emptyProgress({
      resolvedMistakes: { [`${TEST_GENERATOR_ID}::easy::1`]: true },
      attempts: [
        {
          completedAt: '2026-01-01T00:00:00.000Z',
          topics: ['fake-topic'],
          problems: [{ generatorId: TEST_GENERATOR_ID, difficulty: 'easy', seed: 1, correct: false }],
        },
      ],
    });
    assert.equal(collectMistakes(progress).length, 0);
  });

  QUnit.test('collectMistakes dedupes the same problem instance and sorts most-recently-missed first', (assert) => {
    const progress = emptyProgress({
      attempts: [
        {
          completedAt: '2026-01-01T00:00:00.000Z',
          topics: ['fake-topic'],
          problems: [{ generatorId: TEST_GENERATOR_ID, difficulty: 'easy', seed: 1, correct: false }],
        },
        {
          completedAt: '2026-02-01T00:00:00.000Z',
          topics: ['fake-topic'],
          problems: [
            { generatorId: TEST_GENERATOR_ID, difficulty: 'easy', seed: 1, correct: false },
            { generatorId: TEST_GENERATOR_ID, difficulty: 'easy', seed: 2, correct: false },
          ],
        },
      ],
    });
    const mistakes = collectMistakes(progress);
    assert.equal(mistakes.length, 2, 'the seed:1 problem is only queued once despite being missed twice');
    assert.equal(mistakes[0].seed, 1, 'the most recently missed one comes first');
    assert.equal(mistakes[0].missedAt, '2026-02-01T00:00:00.000Z');
  });

  QUnit.test('collectMistakes respects the limit option', (assert) => {
    const problems = Array.from({ length: 5 }, (_, i) => ({ generatorId: TEST_GENERATOR_ID, difficulty: 'easy', seed: i, correct: false }));
    const progress = emptyProgress({ attempts: [{ completedAt: '2026-01-01T00:00:00.000Z', topics: ['fake-topic'], problems }] });
    assert.equal(collectMistakes(progress, { limit: 2 }).length, 2);
  });

  QUnit.test('groupMistakesByTopic counts mistakes per topic, falling back to "unknown" when a mistake has no topic', (assert) => {
    const mistakes = [
      { topics: ['additionFacts'] },
      { topics: ['additionFacts'] },
      { topics: ['fractionsDecimals'] },
      { topics: [] },
    ];
    assert.deepEqual(groupMistakesByTopic(mistakes), [
      { topic: 'additionFacts', count: 2 },
      { topic: 'fractionsDecimals', count: 1 },
      { topic: 'unknown', count: 1 },
    ]);
  });

  QUnit.test('markMistakeResolved persists and is idempotent', (assert) => {
    markMistakeResolved('profile_x', 'a::easy::1');
    assert.ok(getProgress('profile_x').resolvedMistakes['a::easy::1']);

    markMistakeResolved('profile_x', 'a::easy::1');
    assert.deepEqual(Object.keys(getProgress('profile_x').resolvedMistakes), ['a::easy::1']);
  });
});
