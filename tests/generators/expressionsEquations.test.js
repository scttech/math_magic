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

  QUnit.test('evaluateExponent: the answer always equals base^exponent, adjusted by the extra operation at hard difficulty', (assert) => {
    const gen = byId['grade6.expressionsEquations.evaluateExponent'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 60; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const { base, exponent } = problem.meta;
        const power = base ** exponent;
        if (difficulty !== 'hard') {
          assert.equal(problem.answer, power, `[${difficulty}] seed ${seed}: ${base}^${exponent} = ${power}`);
        } else {
          const { op, extra } = problem.meta;
          const expected = op === 'add' ? power + extra : power * extra;
          assert.equal(problem.answer, expected, `[${difficulty}] seed ${seed}: ${base}^${exponent} ${op} ${extra} = ${expected}`);
        }
      }
    }
  });

  QUnit.test('identifyExpressionParts: the asked-for part always matches the expression that was actually built', (assert) => {
    const gen = byId['grade6.expressionsEquations.identifyExpressionParts'];
    for (let seed = 0; seed < 150; seed++) {
      const rng = createRng(seed);
      const problem = gen.generate({ difficulty: 'medium', rng });
      const { ask, coeff, constant } = problem.meta;
      if (ask === 'coefficient') assert.equal(problem.answer, coeff, `seed ${seed}: coefficient`);
      else if (ask === 'constant') assert.equal(problem.answer, constant, `seed ${seed}: constant`);
      else assert.equal(problem.answer, constant === 0 ? 1 : 2, `seed ${seed}: term count`);
    }
  });

  QUnit.test('isASolution: equation kind agrees with direct substitution, inequality kind agrees with the actual comparison', (assert) => {
    const gen = byId['grade6.expressionsEquations.isASolution'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 100; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        if (problem.meta.kind === 'equation') {
          const { a, b, c, candidate } = problem.meta;
          const expected = a * candidate + b === c;
          assert.equal(problem.answer, expected, `[${difficulty}] seed ${seed}: equation substitution`);
        } else {
          const { threshold, symbol, candidate } = problem.meta;
          const expected =
            symbol === '>' ? candidate > threshold : symbol === '<' ? candidate < threshold : symbol === '≥' ? candidate >= threshold : candidate <= threshold;
          assert.equal(problem.answer, expected, `[${difficulty}] seed ${seed}: inequality comparison`);
        }
        assert.notOk(problem.checkAnswer(problem.answer ? 'no' : 'yes'), `[${difficulty}] seed ${seed}: rejects the opposite yes/no answer`);
      }
    }
  });

  QUnit.test('writeInequality: checkAnswer is flexible about spacing, the variable letter, and >=/<= vs ≥/≤, but strict about the direction', (assert) => {
    const gen = byId['grade6.expressionsEquations.writeInequality'];
    for (let seed = 0; seed < 40; seed++) {
      const rng = createRng(seed);
      const problem = gen.generate({ difficulty: 'medium', rng });
      const { symbol, threshold } = problem.meta;
      const asciiSymbol = symbol === '≥' ? '>=' : symbol === '≤' ? '<=' : symbol;

      assert.ok(problem.checkAnswer(`x${symbol}${threshold}`), `seed ${seed}: accepts no spaces`);
      assert.ok(problem.checkAnswer(`x ${asciiSymbol} ${threshold}`), `seed ${seed}: accepts the ASCII form with spaces`);
      assert.ok(problem.checkAnswer(`${symbol} ${threshold}`), `seed ${seed}: accepts no variable at all`);
      assert.ok(problem.checkAnswer(`n ${symbol} ${threshold}`), `seed ${seed}: accepts a different variable letter`);
      assert.notOk(problem.checkAnswer(`x ${symbol} ${threshold + 1}`), `seed ${seed}: rejects the wrong number`);

      const oppositeStrict = symbol === '>' || symbol === '≥' ? '<' : '>';
      assert.notOk(problem.checkAnswer(`x ${oppositeStrict} ${threshold}`), `seed ${seed}: rejects the opposite direction`);
    }
  });
});
