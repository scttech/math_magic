import { createRng } from '../../../js/core/rng.js';
import { generators } from '../../../js/generators/grade5/classifyShapes.js';

const byId = Object.fromEntries(generators.map((g) => [g.id, g]));

QUnit.module('generators/grade5/classifyShapes', () => {
  QUnit.test('every generator declares grade 5 and the classifyShapes topic', (assert) => {
    for (const gen of generators) {
      assert.equal(gen.grade, '5', `${gen.id} grade`);
      assert.equal(gen.topic, 'classifyShapes', `${gen.id} topic`);
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

  QUnit.test('classifyShapes: checkAnswer is flexible about True/False wording and always rejects the opposite answer', (assert) => {
    const gen = byId['grade5.classifyShapes.classifyShapes'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 60; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const isTrue = problem.answer === true;
        assert.ok(problem.checkAnswer(isTrue ? 'yes' : 'no'), `[${difficulty}] seed ${seed}: accepts yes/no synonym`);
        assert.ok(problem.checkAnswer(isTrue ? 'T' : 'F'), `[${difficulty}] seed ${seed}: accepts T/F shorthand`);
        assert.notOk(problem.checkAnswer(isTrue ? 'false' : 'true'), `[${difficulty}] seed ${seed}: rejects the opposite answer`);
      }
    }
  });

  QUnit.test('every statement in the pool has a non-empty explanation', (assert) => {
    const gen = byId['grade5.classifyShapes.classifyShapes'];
    const seenStatements = new Set();
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 100; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        assert.ok(problem.meta.explanation && problem.meta.explanation.length > 10, `[${difficulty}] seed ${seed}: has a real explanation`);
        seenStatements.add(problem.meta.statement);
      }
    }
    assert.ok(seenStatements.size >= 10, `sampled at least 10 distinct statements across all difficulties (saw ${seenStatements.size})`);
  });
});
