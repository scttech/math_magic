import { createRng } from '../../../js/core/rng.js';
import { generators } from '../../../js/generators/grade5/measurementVolume.js';

const byId = Object.fromEntries(generators.map((g) => [g.id, g]));

QUnit.module('generators/grade5/measurementVolume', () => {
  QUnit.test('every generator declares grade 5 and the measurementVolume topic', (assert) => {
    for (const gen of generators) {
      assert.equal(gen.grade, '5', `${gen.id} grade`);
      assert.equal(gen.topic, 'measurementVolume', `${gen.id} topic`);
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

  QUnit.test('convertMeasurementUnits: multiplying/dividing by the factor always round-trips the prompt value', (assert) => {
    const gen = byId['grade5.measurementVolume.convertMeasurementUnits'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 80; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const { factor, direction, promptValue } = problem.meta;
        const expected = direction === 'toSmall' ? promptValue * factor : promptValue / factor;
        assert.ok(Math.abs(problem.answer - expected) < 1e-9, `[${difficulty}] seed ${seed}: ${promptValue} ${direction}`);
      }
    }
  });

  QUnit.test('volumeRectangularPrism: the answer always equals length × width × height', (assert) => {
    const gen = byId['grade5.measurementVolume.volumeRectangularPrism'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 60; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const { length, width, height } = problem.meta;
        assert.equal(problem.answer, length * width * height, `[${difficulty}] seed ${seed}: ${length}×${width}×${height}`);
      }
    }
  });

  QUnit.test('compositeVolume: the answer always equals the sum of the two prisms’ volumes', (assert) => {
    const gen = byId['grade5.measurementVolume.compositeVolume'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 60; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const { dims1, dims2 } = problem.meta;
        const expected = dims1[0] * dims1[1] * dims1[2] + dims2[0] * dims2[1] * dims2[2];
        assert.equal(problem.answer, expected, `[${difficulty}] seed ${seed}: composite volume`);
      }
    }
  });
});
