import { createRng } from '../../js/core/rng.js';
import { generateProblem } from '../../js/skills/divisionFacts.js';

QUnit.module('skills/divisionFacts', () => {
  QUnit.test('generateProblem is deterministic for a given seed and always divides evenly', (assert) => {
    const rng = createRng(42);
    const problem = generateProblem(rng, [3], [4]);
    assert.equal(problem.divisor, 3);
    assert.equal(problem.quotient, 4);
    assert.equal(problem.dividend, 12);
    assert.equal(problem.answer, 4);
    assert.equal(problem.answerDisplay, '4');
    assert.equal(problem.promptText, '12 ÷ 3');
  });

  QUnit.test('generateProblem returns 4 unique non-negative choices including the correct quotient, across many seeds and pools', (assert) => {
    for (let seed = 0; seed < 200; seed++) {
      const rng = createRng(seed);
      const problem = generateProblem(rng, [1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 5]);
      assert.equal(problem.dividend, problem.divisor * problem.quotient, `seed ${seed}: dividend is divisor times quotient`);
      assert.equal(problem.choices.length, 4, `seed ${seed}: 4 choices`);
      assert.equal(new Set(problem.choices).size, 4, `seed ${seed}: choices are unique`);
      assert.ok(problem.choices.includes(problem.answerDisplay), `seed ${seed}: choices include the correct answer`);
      for (const choice of problem.choices) {
        assert.ok(Number(choice) >= 0, `seed ${seed}: choice ${choice} is non-negative`);
      }
    }
  });
});
