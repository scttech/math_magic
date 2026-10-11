import { createRng } from '../../../js/core/rng.js';
import { generators } from '../../../js/generators/grade5/multiDigitArithmetic.js';

const byId = Object.fromEntries(generators.map((g) => [g.id, g]));

QUnit.module('generators/grade5/multiDigitArithmetic', () => {
  QUnit.test('every generator declares grade 5 and the multiDigitArithmetic topic', (assert) => {
    for (const gen of generators) {
      assert.equal(gen.grade, '5', `${gen.id} grade`);
      assert.equal(gen.topic, 'multiDigitArithmetic', `${gen.id} topic`);
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

  QUnit.test('multiplyMultiDigit: the answer always equals a × b', (assert) => {
    const gen = byId['grade5.multiDigitArithmetic.multiplyMultiDigit'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 60; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const { a, b } = problem.meta;
        assert.equal(problem.answer, a * b, `[${difficulty}] seed ${seed}: ${a} × ${b}`);
      }
    }
  });

  QUnit.test('divideMultiDigit: dividend always equals divisor×quotient + remainder, and the remainder is smaller than the divisor', (assert) => {
    const gen = byId['grade5.multiDigitArithmetic.divideMultiDigit'];
    for (const difficulty of gen.difficulties) {
      let sawRemainder = false;
      for (let seed = 0; seed < 100; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const { dividend, divisor, quotient, remainder } = problem.meta;
        assert.equal(dividend, divisor * quotient + remainder, `[${difficulty}] seed ${seed}: dividend matches divisor×quotient+remainder`);
        assert.ok(remainder < divisor, `[${difficulty}] seed ${seed}: remainder smaller than divisor`);
        assert.ok(dividend <= 9999, `[${difficulty}] seed ${seed}: dividend stays within 4 digits`);
        if (remainder > 0) sawRemainder = true;
      }
      if (difficulty === 'hard') assert.ok(sawRemainder, `[${difficulty}]: at least one seed produced a nonzero remainder`);
    }
  });

  QUnit.test('divideMultiDigit: checkAnswer accepts "R" remainder notation with flexible spacing/casing', (assert) => {
    const gen = byId['grade5.multiDigitArithmetic.divideMultiDigit'];
    for (let seed = 0; seed < 100; seed++) {
      const rng = createRng(seed);
      const problem = gen.generate({ difficulty: 'hard', rng });
      const { quotient, remainder } = problem.meta;
      if (remainder === 0) continue;
      assert.ok(problem.checkAnswer(`${quotient} R ${remainder}`), `seed ${seed}: accepts spaced form`);
      assert.ok(problem.checkAnswer(`${quotient}r${remainder}`), `seed ${seed}: accepts lowercase no-space form`);
      assert.notOk(problem.checkAnswer(`${quotient}`), `seed ${seed}: rejects the quotient alone when there is a remainder`);
    }
  });

  QUnit.test('addSubtractDecimals: the answer always equals a ± b rounded to hundredths, and subtraction never goes negative', (assert) => {
    const gen = byId['grade5.multiDigitArithmetic.addSubtractDecimals'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 60; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const { a, b, op } = problem.meta;
        const expected = op === 'add' ? a + b : a - b;
        assert.ok(Math.abs(problem.answer - expected) < 0.005, `[${difficulty}] seed ${seed}: ${a} ${op} ${b}`);
        if (op === 'subtract') assert.ok(problem.answer >= 0, `[${difficulty}] seed ${seed}: subtraction stays non-negative`);
      }
    }
  });

  QUnit.test('multiplyDivideDecimals: multiply answers match a×b, divide answers match the quotient', (assert) => {
    const gen = byId['grade5.multiDigitArithmetic.multiplyDivideDecimals'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 60; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        if (problem.meta.op === 'multiply') {
          const { a, b } = problem.meta;
          assert.ok(Math.abs(problem.answer - a * b) < 1e-3, `[${difficulty}] seed ${seed}: ${a} × ${b}`);
        } else {
          const { dividend, divisor } = problem.meta;
          assert.ok(Math.abs(problem.answer - dividend / divisor) < 1e-2, `[${difficulty}] seed ${seed}: ${dividend} ÷ ${divisor}`);
        }
      }
    }
  });
});
