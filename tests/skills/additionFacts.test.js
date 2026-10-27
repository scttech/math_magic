import { createRng } from '../../js/core/rng.js';
import { generateProblem } from '../../js/skills/additionFacts.js';

QUnit.module('skills/additionFacts', () => {
  QUnit.test('generateProblem is deterministic for a given seed and picks from the given pools', (assert) => {
    const rng = createRng(42);
    const problem = generateProblem(rng, [3], [4]);
    assert.equal(problem.a, 3);
    assert.equal(problem.b, 4);
    assert.equal(problem.answer, 7);
    assert.equal(problem.answerDisplay, '7');
    assert.equal(problem.promptText, '3 + 4');
  });

  QUnit.test('generateProblem returns 4 unique non-negative choices including the correct sum, across many seeds and pools', (assert) => {
    for (let seed = 0; seed < 200; seed++) {
      const rng = createRng(seed);
      const problem = generateProblem(rng, [0, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 5]);
      assert.equal(problem.answer, problem.a + problem.b, `seed ${seed}: answer is the actual sum`);
      assert.equal(problem.choices.length, 4, `seed ${seed}: 4 choices`);
      assert.equal(new Set(problem.choices).size, 4, `seed ${seed}: choices are unique`);
      assert.ok(problem.choices.includes(problem.answerDisplay), `seed ${seed}: choices include the correct answer`);
      for (const choice of problem.choices) {
        assert.ok(Number(choice) >= 0, `seed ${seed}: choice ${choice} is non-negative`);
      }
    }
  });
});
