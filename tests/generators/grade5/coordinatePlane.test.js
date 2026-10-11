import { createRng } from '../../../js/core/rng.js';
import { generators } from '../../../js/generators/grade5/coordinatePlane.js';

const byId = Object.fromEntries(generators.map((g) => [g.id, g]));

QUnit.module('generators/grade5/coordinatePlane', () => {
  QUnit.test('every generator declares grade 5 and the coordinatePlane topic', (assert) => {
    for (const gen of generators) {
      assert.equal(gen.grade, '5', `${gen.id} grade`);
      assert.equal(gen.topic, 'coordinatePlane', `${gen.id} topic`);
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

  QUnit.test('every problem stays in the first quadrant: x and y are always positive, and the grid is flagged quadrant1', (assert) => {
    for (const gen of generators) {
      for (const difficulty of gen.difficulties) {
        for (let seed = 0; seed < 60; seed++) {
          const rng = createRng(seed);
          const problem = gen.generate({ difficulty, rng });
          const { x, y } = problem.meta;
          assert.ok(x > 0 && y > 0, `${gen.id} [${difficulty}] seed ${seed}: (${x}, ${y}) is in the first quadrant`);
          assert.ok(problem.visual && problem.visual.quadrant1 === true, `${gen.id} [${difficulty}] seed ${seed}: visual is flagged quadrant1`);
        }
      }
    }
  });

  QUnit.test('identifyCoordinates: checkAnswer rejects coordinates with a flipped sign (grade-6 style negative input)', (assert) => {
    const gen = byId['grade5.coordinatePlane.identifyCoordinates'];
    for (let seed = 0; seed < 40; seed++) {
      const rng = createRng(seed);
      const problem = gen.generate({ difficulty: 'medium', rng });
      const { x, y } = problem.meta;
      assert.notOk(problem.checkAnswer(`(-${x}, ${y})`), `seed ${seed}: rejects a negative x`);
    }
  });

  QUnit.test('plotPoint: carries an answerVisual for the worksheet answer key, also flagged quadrant1', (assert) => {
    const gen = byId['grade5.coordinatePlane.plotPoint'];
    for (let seed = 0; seed < 30; seed++) {
      const rng = createRng(seed);
      const problem = gen.generate({ difficulty: 'medium', rng });
      assert.ok(problem.visual.answerVisual && problem.visual.answerVisual.quadrant1 === true, `seed ${seed}: answerVisual present and quadrant1`);
    }
  });
});
