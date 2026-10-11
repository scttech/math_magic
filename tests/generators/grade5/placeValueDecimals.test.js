import { createRng } from '../../../js/core/rng.js';
import { generators } from '../../../js/generators/grade5/placeValueDecimals.js';

const byId = Object.fromEntries(generators.map((g) => [g.id, g]));

QUnit.module('generators/grade5/placeValueDecimals', () => {
  QUnit.test('every generator declares grade 5 and the placeValueDecimals topic', (assert) => {
    for (const gen of generators) {
      assert.equal(gen.grade, '5', `${gen.id} grade`);
      assert.equal(gen.topic, 'placeValueDecimals', `${gen.id} topic`);
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

  QUnit.test('multiplyDivideByPowerOfTen: multiplying and dividing are exact inverses of each other', (assert) => {
    const gen = byId['grade5.placeValueDecimals.multiplyDivideByPowerOfTen'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 60; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const { op, base, exponent } = problem.meta;
        const factor = 10 ** exponent;
        const expected = op === 'multiply' ? base * factor : base / factor;
        assert.ok(Math.abs(problem.answer - expected) < 1e-6, `[${difficulty}] seed ${seed}: ${base} ${op} by 10^${exponent}`);
      }
    }
  });

  QUnit.test('placeValueOfDigit: the reported digit always matches the number at that place', (assert) => {
    const gen = byId['grade5.placeValueDecimals.placeValueOfDigit'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 80; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const { display, placeName } = problem.meta;
        const [intPart, decPart] = display.split('.');
        const intNames = ['ones', 'tens', 'hundreds', 'thousands'];
        const decNames = ['tenths', 'hundredths', 'thousandths'];
        let expectedDigit;
        if (intNames.includes(placeName)) {
          const posFromRight = intNames.indexOf(placeName);
          expectedDigit = intPart[intPart.length - 1 - posFromRight];
        } else {
          expectedDigit = decPart[decNames.indexOf(placeName)];
        }
        assert.equal(problem.answerDisplay, expectedDigit, `[${difficulty}] seed ${seed}: digit at ${placeName} in ${display}`);
      }
    }
  });

  QUnit.test('compareDecimals: the symbol always matches a direct numeric comparison', (assert) => {
    const gen = byId['grade5.placeValueDecimals.compareDecimals'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 60; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const { a, b } = problem.meta;
        const expected = a < b ? '<' : a > b ? '>' : '=';
        assert.equal(problem.answer, expected, `[${difficulty}] seed ${seed}: compare ${a} and ${b}`);
      }
    }
  });

  QUnit.test('roundDecimals: the result always equals the value rounded to the requested place', (assert) => {
    const gen = byId['grade5.placeValueDecimals.roundDecimals'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 60; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const { value, roundName } = problem.meta;
        const decimals = roundName === 'whole number' ? 0 : roundName === 'tenth' ? 1 : 2;
        const factor = 10 ** decimals;
        const expected = Math.round(value * factor) / factor;
        assert.ok(Math.abs(problem.answer - expected) < 1e-9, `[${difficulty}] seed ${seed}: round ${value} to nearest ${roundName}`);
      }
    }
  });
});
