import { createRng } from '../../../js/core/rng.js';
import { generators } from '../../../js/generators/grade5/fractionsOperations.js';

const byId = Object.fromEntries(generators.map((g) => [g.id, g]));

function numericValueOf(answer) {
  return typeof answer === 'object' && answer !== null ? answer.num / answer.den : answer;
}

QUnit.module('generators/grade5/fractionsOperations', () => {
  QUnit.test('every generator declares grade 5 and the fractionsOperations topic', (assert) => {
    for (const gen of generators) {
      assert.equal(gen.grade, '5', `${gen.id} grade`);
      assert.equal(gen.topic, 'fractionsOperations', `${gen.id} topic`);
    }
  });

  for (const gen of generators) {
    for (const difficulty of gen.difficulties) {
      QUnit.test(`${gen.id} [${difficulty}] checkAnswer accepts correct and rejects wrong answers`, (assert) => {
        for (let seed = 0; seed < 50; seed++) {
          const rng = createRng(seed);
          const problem = gen.generate({ difficulty, rng });
          assert.ok(problem.checkAnswer(problem.answerDisplay), `seed ${seed}: accepts its own answer for "${problem.promptText}"`);
          assert.notOk(problem.checkAnswer('definitely-not-a-valid-answer'), `seed ${seed}: rejects garbage input`);
        }
      });
    }
  }

  QUnit.test('addSubtractUnlikeFractions: the answer always matches a ± b exactly, and subtraction never goes negative', (assert) => {
    const gen = byId['grade5.fractionsOperations.addSubtractUnlikeFractions'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 60; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const { a, b, op } = problem.meta;
        const expected = op === 'add' ? a.num / a.den + b.num / b.den : a.num / a.den - b.num / b.den;
        assert.ok(Math.abs(numericValueOf(problem.answer) - expected) < 1e-9, `[${difficulty}] seed ${seed}: ${op} of ${a.num}/${a.den} and ${b.num}/${b.den}`);
        if (op === 'subtract') assert.ok(numericValueOf(problem.answer) >= 0, `[${difficulty}] seed ${seed}: subtraction stays non-negative`);
      }
    }
  });

  QUnit.test('fractionAsDivision: the answer always equals items/people in lowest terms', (assert) => {
    const gen = byId['grade5.fractionsOperations.fractionAsDivision'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 60; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const { items, people } = problem.meta;
        assert.ok(Math.abs(numericValueOf(problem.answer) - items / people) < 1e-9, `[${difficulty}] seed ${seed}: ${items} shared among ${people}`);
      }
    }
  });

  QUnit.test('multiplyFraction: "of a whole" answers and fraction×fraction answers are both correct', (assert) => {
    const gen = byId['grade5.fractionsOperations.multiplyFraction'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 60; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        if (problem.meta.mode === 'ofWhole') {
          const { fraction, whole } = problem.meta;
          const expected = (fraction.num / fraction.den) * whole;
          assert.ok(Math.abs(numericValueOf(problem.answer) - expected) < 1e-9, `[${difficulty}] seed ${seed}: ${fraction.num}/${fraction.den} of ${whole}`);
        } else {
          const { a, b } = problem.meta;
          const expected = (a.num / a.den) * (b.num / b.den);
          assert.ok(Math.abs(numericValueOf(problem.answer) - expected) < 1e-9, `[${difficulty}] seed ${seed}: ${a.num}/${a.den} × ${b.num}/${b.den}`);
        }
      }
    }
  });

  QUnit.test('divideUnitFraction: both directions match plain division', (assert) => {
    const gen = byId['grade5.fractionsOperations.divideUnitFraction'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 60; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const { direction, den, whole } = problem.meta;
        const expected = direction === 'fractionByWhole' ? 1 / den / whole : whole * den;
        assert.ok(Math.abs(numericValueOf(problem.answer) - expected) < 1e-9, `[${difficulty}] seed ${seed}: ${direction}`);
      }
    }
  });
});
