import { createRng } from '../../js/core/rng.js';
import { generateProblem, isReducible } from '../../js/skills/fractionSimplification.js';

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

QUnit.module('skills/fractionSimplification', () => {
  QUnit.test('isReducible identifies composite denominators and rejects primes', (assert) => {
    assert.notOk(isReducible(2), '2 is prime');
    assert.notOk(isReducible(3), '3 is prime');
    assert.notOk(isReducible(7), '7 is prime');
    assert.ok(isReducible(4));
    assert.ok(isReducible(12));
    assert.ok(isReducible(100));
  });

  QUnit.test('generateProblem always returns an already-reducible fraction, fully reduced in the answer', (assert) => {
    for (let seed = 0; seed < 300; seed++) {
      const rng = createRng(seed);
      const problem = generateProblem(rng, [4, 6, 8, 9, 12, 16, 100]);
      assert.ok(problem.numerator < problem.denominator, `seed ${seed}: proper fraction`);
      assert.ok(gcd(problem.numerator, problem.denominator) > 1, `seed ${seed}: the original fraction actually needs simplifying`);

      const [simplifiedNum, simplifiedDen] = problem.answerDisplay.split('/').map(Number);
      assert.equal(gcd(simplifiedNum, simplifiedDen), 1, `seed ${seed}: answer ${problem.answerDisplay} is fully reduced`);
      assert.equal(simplifiedNum / simplifiedDen, problem.numerator / problem.denominator, `seed ${seed}: answer is equivalent to the original fraction`);
    }
  });

  QUnit.test('generateProblem returns 4 unique choices including the correct answer', (assert) => {
    for (let seed = 0; seed < 300; seed++) {
      const rng = createRng(seed);
      const problem = generateProblem(rng, [4, 6, 8, 9, 12, 16, 100]);
      assert.equal(problem.choices.length, 4, `seed ${seed}: 4 choices`);
      assert.equal(new Set(problem.choices).size, 4, `seed ${seed}: choices are unique`);
      assert.ok(problem.choices.includes(problem.answerDisplay), `seed ${seed}: choices include the correct answer`);
    }
  });

  QUnit.test('only ever draws from denominators that are actually reducible', (assert) => {
    for (let seed = 0; seed < 100; seed++) {
      const rng = createRng(seed);
      const problem = generateProblem(rng, [4, 9]);
      assert.ok([4, 9].includes(problem.denominator), `seed ${seed}: denominator drawn from the given pool`);
    }
  });
});
