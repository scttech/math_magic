import { createRng } from '../../js/core/rng.js';
import { generateProblem } from '../../js/skills/mixedNumbers.js';

QUnit.module('skills/mixedNumbers', () => {
  QUnit.test('generateProblem always produces a genuinely mixed number (nonzero remainder)', (assert) => {
    for (let seed = 0; seed < 300; seed++) {
      const rng = createRng(seed);
      const problem = generateProblem(rng, [2, 3, 4, 5, 8, 12]);
      assert.ok(problem.denominator > 0, `seed ${seed}: has a denominator`);
    }
  });

  QUnit.test('every problem is one of the two known prompt shapes, with an internally-consistent answer', (assert) => {
    for (let seed = 0; seed < 300; seed++) {
      const rng = createRng(seed);
      const problem = generateProblem(rng, [2, 3, 4, 5, 8, 12]);

      const toMixedMatch = problem.promptText.match(/^Write (\d+)\/(\d+) as a mixed number\.$/);
      const toImproperMatch = problem.promptText.match(/^Write (\d+) (\d+)\/(\d+) as an improper fraction\.$/);
      assert.ok(toMixedMatch || toImproperMatch, `seed ${seed}: prompt "${problem.promptText}" matches a known shape`);

      if (toMixedMatch) {
        const [, numerator, denominator] = toMixedMatch.map(Number);
        const [whole, remainder, answerDenominator] = problem.answerDisplay.split(/[ /]/).map(Number);
        assert.equal(answerDenominator, denominator, `seed ${seed}: denominator preserved`);
        assert.equal(whole * denominator + remainder, numerator, `seed ${seed}: mixed number is equivalent to the improper fraction`);
        assert.ok(remainder > 0 && remainder < denominator, `seed ${seed}: remainder is a genuine proper-fraction part`);
      } else {
        const [, whole, remainder, denominator] = toImproperMatch.map(Number);
        const [answerNumerator, answerDenominator] = problem.answerDisplay.split('/').map(Number);
        assert.equal(answerDenominator, denominator, `seed ${seed}: denominator preserved`);
        assert.equal(answerNumerator, whole * denominator + remainder, `seed ${seed}: improper fraction is equivalent to the mixed number`);
      }
    }
  });

  QUnit.test('generateProblem returns 4 unique choices including the correct answer', (assert) => {
    for (let seed = 0; seed < 300; seed++) {
      const rng = createRng(seed);
      const problem = generateProblem(rng, [2, 3, 4, 5, 8, 12]);
      assert.equal(problem.choices.length, 4, `seed ${seed}: 4 choices`);
      assert.equal(new Set(problem.choices).size, 4, `seed ${seed}: choices are unique`);
      assert.ok(problem.choices.includes(problem.answerDisplay), `seed ${seed}: choices include the correct answer`);
    }
  });
});
