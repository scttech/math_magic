import '../../js/generators/grade6/index.js';
import { buildProblemSet } from '../../js/core/problemSet.js';

const PARAMS = { grade: '6', topics: ['fractionsDecimals', 'ratiosProportions'], difficulty: 'medium', count: 8, seed: 42 };

QUnit.module('core/problemSet', () => {
  QUnit.test('buildProblemSet returns the requested count', (assert) => {
    const problems = buildProblemSet(PARAMS);
    assert.equal(problems.length, PARAMS.count);
  });

  QUnit.test('buildProblemSet is deterministic for the same seed', (assert) => {
    const a = buildProblemSet(PARAMS);
    const b = buildProblemSet(PARAMS);
    assert.deepEqual(
      a.map((p) => p.promptText),
      b.map((p) => p.promptText)
    );
  });

  QUnit.test('a different seed produces a different set', (assert) => {
    const a = buildProblemSet(PARAMS);
    const b = buildProblemSet({ ...PARAMS, seed: 43 });
    assert.notDeepEqual(
      a.map((p) => p.promptText),
      b.map((p) => p.promptText)
    );
  });

  QUnit.test('each problem carries its own reproducible seed (seed + index)', (assert) => {
    const problems = buildProblemSet(PARAMS);
    problems.forEach((p, i) => assert.equal(p.seed, PARAMS.seed + i));
  });

  QUnit.test('each problem is tagged with a topic from the requested set', (assert) => {
    const problems = buildProblemSet(PARAMS);
    for (const p of problems) {
      assert.ok(PARAMS.topics.includes(p.topic), `"${p.topic}" is one of the requested topics`);
    }
  });
});
