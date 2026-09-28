import { createRng } from '../../js/core/rng.js';
import { parseFactorSpec, generateProblem, MIN_FACTOR, MAX_FACTOR } from '../../js/skills/multiplicationTables.js';

QUnit.module('skills/multiplicationTables', () => {
  QUnit.test('parseFactorSpec parses a single number', (assert) => {
    assert.deepEqual(parseFactorSpec('2'), [2]);
  });

  QUnit.test('parseFactorSpec parses a range', (assert) => {
    assert.deepEqual(parseFactorSpec('1-12'), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  QUnit.test('parseFactorSpec swaps a reversed range', (assert) => {
    assert.deepEqual(parseFactorSpec('12-10'), [10, 11, 12]);
  });

  QUnit.test('parseFactorSpec parses a comma list mixed with a range, deduping and sorting', (assert) => {
    assert.deepEqual(parseFactorSpec('2, 5-7, 2'), [2, 5, 6, 7]);
  });

  QUnit.test('parseFactorSpec trims whitespace around tokens', (assert) => {
    assert.deepEqual(parseFactorSpec('  2 ,  4  '), [2, 4]);
  });

  QUnit.test('parseFactorSpec rejects an empty or blank spec', (assert) => {
    assert.equal(parseFactorSpec(''), null);
    assert.equal(parseFactorSpec('   '), null);
  });

  QUnit.test('parseFactorSpec rejects non-numeric tokens', (assert) => {
    assert.equal(parseFactorSpec('abc'), null);
    assert.equal(parseFactorSpec('2,abc'), null);
  });

  QUnit.test('parseFactorSpec rejects negative numbers', (assert) => {
    assert.equal(parseFactorSpec('-5'), null);
  });

  QUnit.test('parseFactorSpec rejects values outside the allowed bounds', (assert) => {
    assert.equal(parseFactorSpec(`${MAX_FACTOR + 1}`), null);
    assert.equal(parseFactorSpec(`${MIN_FACTOR - 1}`), null);
  });

  QUnit.test('generateProblem is deterministic for a given seed and picks from the given factor pools', (assert) => {
    const rng = createRng(42);
    const problem = generateProblem(rng, [3], [4]);
    assert.equal(problem.a, 3);
    assert.equal(problem.b, 4);
    assert.equal(problem.answer, 12);
    assert.equal(problem.answerDisplay, '12');
    assert.equal(problem.promptText, '3 × 4');
  });

  QUnit.test('generateProblem returns 4 unique non-negative choices including the correct answer', (assert) => {
    for (let seed = 0; seed < 200; seed++) {
      const rng = createRng(seed);
      const problem = generateProblem(rng, [0, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 5]);
      assert.equal(problem.choices.length, 4, `seed ${seed}: 4 choices`);
      assert.equal(new Set(problem.choices).size, 4, `seed ${seed}: choices are unique`);
      assert.ok(problem.choices.includes(problem.answerDisplay), `seed ${seed}: choices include the correct answer`);
      for (const choice of problem.choices) {
        assert.ok(Number(choice) >= 0, `seed ${seed}: choice ${choice} is non-negative`);
      }
    }
  });
});
