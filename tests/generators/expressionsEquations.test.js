import { createRng } from '../../js/core/rng.js';
import { generators, formatLinearExpression, parseLinearExpression } from '../../js/generators/grade6/expressionsEquations.js';

const byId = Object.fromEntries(generators.map((g) => [g.id, g]));

const fixedSeedFixtures = {
  'grade6.expressionsEquations.evaluateExpression': {
    easy: { promptText: 'Evaluate 10x when x = 0.', answerDisplay: '0' },
    medium: { promptText: 'Evaluate 15x - 6 when x = 0.', answerDisplay: '-6' },
    hard: { promptText: 'Evaluate 12(x - 5) when x = 0.', answerDisplay: '-60' },
  },
  'grade6.expressionsEquations.simplifyExpression': {
    easy: { promptText: 'Simplify: 8x - 3x', answerDisplay: '5x' },
    medium: { promptText: 'Simplify: 12x - 5x', answerDisplay: '7x' },
    hard: { promptText: 'Simplify: 10(x - 4) + 7x', answerDisplay: '17x - 40' },
  },
  'grade6.expressionsEquations.solveEquation': {
    easy: { promptText: 'x - 5 = 10. Solve for x.', answerDisplay: '15' },
    medium: { promptText: '-3x = -36. Solve for x.', answerDisplay: '12' },
    hard: { promptText: '-4x = -60. Solve for x.', answerDisplay: '15' },
  },
};

QUnit.module('generators/grade6/expressionsEquations', () => {
  QUnit.test('every generator declares grade 6 and the expressionsEquations topic', (assert) => {
    for (const gen of generators) {
      assert.equal(gen.grade, '6', `${gen.id} grade`);
      assert.equal(gen.topic, 'expressionsEquations', `${gen.id} topic`);
    }
  });

  QUnit.test('formatLinearExpression / parseLinearExpression round-trip', (assert) => {
    const cases = [
      { coeff: 8, constant: -2 },
      { coeff: -1, constant: 5 },
      { coeff: 0, constant: -7 },
      { coeff: 3, constant: 0 },
      { coeff: -6, constant: -9 },
    ];
    for (const c of cases) {
      const formatted = formatLinearExpression(c);
      assert.deepEqual(parseLinearExpression(formatted), c, `round-trips "${formatted}"`);
    }
  });

  for (const [id, byDifficulty] of Object.entries(fixedSeedFixtures)) {
    for (const [difficulty, expected] of Object.entries(byDifficulty)) {
      QUnit.test(`${id} [${difficulty}] is deterministic for seed 12345`, (assert) => {
        const rng = createRng(12345);
        const problem = byId[id].generate({ difficulty, rng });
        assert.equal(problem.promptText, expected.promptText);
        assert.equal(problem.answerDisplay, expected.answerDisplay);
      });
    }
  }

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
});
