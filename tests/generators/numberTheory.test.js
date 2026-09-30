import { createRng } from '../../js/core/rng.js';
import { gcd } from '../../js/core/problemGenerator.js';
import { generators } from '../../js/generators/grade6/numberTheory.js';

const byId = Object.fromEntries(generators.map((g) => [g.id, g]));

QUnit.module('generators/grade6/numberTheory', () => {
  QUnit.test('every generator declares grade 6 and the numberTheory topic', (assert) => {
    for (const gen of generators) {
      assert.equal(gen.grade, '6', `${gen.id} grade`);
      assert.equal(gen.topic, 'numberTheory', `${gen.id} topic`);
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

  QUnit.test('longDivision: dividend always equals divisor×quotient + remainder, and the remainder is smaller than the divisor', (assert) => {
    const gen = byId['grade6.numberTheory.longDivision'];
    for (const difficulty of gen.difficulties) {
      let sawRemainder = false;
      for (let seed = 0; seed < 100; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const { dividend, divisor, quotient, remainder } = problem.meta;
        assert.equal(dividend, divisor * quotient + remainder, `[${difficulty}] seed ${seed}: dividend matches divisor×quotient+remainder`);
        assert.ok(remainder < divisor, `[${difficulty}] seed ${seed}: remainder is smaller than divisor`);
        if (remainder > 0) sawRemainder = true;
      }
      if (difficulty === 'hard') assert.ok(sawRemainder, `[${difficulty}]: at least one seed produced a nonzero remainder`);
    }
  });

  QUnit.test('longDivision: checkAnswer accepts "R" remainder notation with flexible spacing/casing', (assert) => {
    const gen = byId['grade6.numberTheory.longDivision'];
    for (let seed = 0; seed < 100; seed++) {
      const rng = createRng(seed);
      const problem = gen.generate({ difficulty: 'hard', rng });
      const { quotient, remainder } = problem.meta;
      if (remainder === 0) continue;
      assert.ok(problem.checkAnswer(`${quotient} R ${remainder}`), `seed ${seed}: accepts spaced form`);
      assert.ok(problem.checkAnswer(`${quotient}r${remainder}`), `seed ${seed}: accepts lowercase no-space form`);
      assert.ok(problem.checkAnswer(`${quotient} remainder ${remainder}`), `seed ${seed}: accepts the word "remainder"`);
      assert.notOk(problem.checkAnswer(`${quotient}`), `seed ${seed}: rejects the quotient alone when there is a remainder`);
      assert.notOk(problem.checkAnswer(`${quotient} R ${remainder + 1}`), `seed ${seed}: rejects the wrong remainder`);
    }
  });

  QUnit.test('greatestCommonFactor: the answer is always gcd(a, b) and evenly divides both', (assert) => {
    const gen = byId['grade6.numberTheory.greatestCommonFactor'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 60; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const { a, b } = problem.meta;
        assert.equal(problem.answer, gcd(a, b), `[${difficulty}] seed ${seed}: gcd(${a}, ${b})`);
        assert.equal(a % problem.answer, 0, `[${difficulty}] seed ${seed}: divides a`);
        assert.equal(b % problem.answer, 0, `[${difficulty}] seed ${seed}: divides b`);
      }
    }
  });

  QUnit.test('leastCommonMultiple: the answer is always a common multiple of a and b, and the smallest one', (assert) => {
    const gen = byId['grade6.numberTheory.leastCommonMultiple'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 60; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const { a, b } = problem.meta;
        assert.equal(problem.answer % a, 0, `[${difficulty}] seed ${seed}: multiple of a`);
        assert.equal(problem.answer % b, 0, `[${difficulty}] seed ${seed}: multiple of b`);
        assert.equal(problem.answer, (a * b) / gcd(a, b), `[${difficulty}] seed ${seed}: matches a×b/gcd(a,b)`);
      }
    }
  });

  QUnit.test('distributiveGcf: g is the true GCF of a and b, and g×m=a, g×n=b with m,n coprime', (assert) => {
    const gen = byId['grade6.numberTheory.distributiveGcf'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 60; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const { a, b, g, m, n } = problem.meta;
        assert.equal(g, gcd(a, b), `[${difficulty}] seed ${seed}: g is the actual GCF`);
        assert.equal(g * m, a, `[${difficulty}] seed ${seed}: g×m = a`);
        assert.equal(g * n, b, `[${difficulty}] seed ${seed}: g×n = b`);
        assert.equal(gcd(m, n), 1, `[${difficulty}] seed ${seed}: m and n share no common factor`);
        assert.ok(a <= 100 && b <= 100, `[${difficulty}] seed ${seed}: both numbers stay within 100`);
      }
    }
  });
});
