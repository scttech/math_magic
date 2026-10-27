import { createRng } from '../../js/core/rng.js';
import { generateProblem } from '../../js/skills/subtractionFacts.js';

QUnit.module('skills/subtractionFacts', () => {
  QUnit.test('generateProblem always subtracts the smaller number from the larger, so the answer is never negative', (assert) => {
    for (let seed = 0; seed < 200; seed++) {
      const rng = createRng(seed);
      const problem = generateProblem(rng, [0, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 5]);
      assert.ok(problem.a >= problem.b, `seed ${seed}: a (${problem.a}) is at least b (${problem.b})`);
      assert.equal(problem.answer, problem.a - problem.b, `seed ${seed}: answer is the actual difference`);
      assert.ok(problem.answer >= 0, `seed ${seed}: answer is never negative`);
    }
  });

  QUnit.test('generateProblem returns 4 unique non-negative choices including the correct difference, across many seeds', (assert) => {
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
