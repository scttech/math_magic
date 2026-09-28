import { createRng } from '../../js/core/rng.js';
import { generators } from '../../js/generators/grade6/areaSurfaceVolume.js';

const byId = Object.fromEntries(generators.map((g) => [g.id, g]));

const fixedSeedFixtures = {
  'grade6.areaSurfaceVolume.areaRectangleTriangle': {
    easy: { promptText: 'What is the area of a triangle with base 5 and height 8?', answerDisplay: '20 square units' },
    medium: { promptText: 'What is the area of a triangle with base 8 and height 11?', answerDisplay: '44 square units' },
    hard: { promptText: 'What is the area of a triangle with base 10 and height 14?', answerDisplay: '70 square units' },
  },
  'grade6.areaSurfaceVolume.areaParallelogram': {
    easy: { promptText: 'What is the area of a parallelogram with base 12 and height 5?', answerDisplay: '60 square units' },
    medium: { promptText: 'What is the area of a parallelogram with base 20 and height 8?', answerDisplay: '160 square units' },
    hard: { promptText: 'What is the area of a parallelogram with base 10 and height 21?', answerDisplay: '210 square units' },
  },
  'grade6.areaSurfaceVolume.volumeRectangularPrism': {
    easy: {
      promptText: 'What is the volume of a rectangular prism with length 8, width 4, and height 5?',
      answerDisplay: '160 cubic units',
    },
    medium: {
      promptText: 'What is the volume of a rectangular prism with length 12, width 5, and height 7?',
      answerDisplay: '420 cubic units',
    },
    hard: {
      promptText: 'What is the volume of a rectangular prism with length 6, width 12.7, and height 6?',
      answerDisplay: '457.2 cubic units',
    },
  },
  'grade6.areaSurfaceVolume.surfaceAreaRectangularPrism': {
    easy: {
      promptText: 'What is the surface area of a rectangular prism with length 8, width 4, and height 5?',
      answerDisplay: '184 square units',
    },
    medium: {
      promptText: 'What is the surface area of a rectangular prism with length 12, width 5, and height 7?',
      answerDisplay: '358 square units',
    },
    hard: {
      promptText: 'What is the surface area of a rectangular prism with length 6, width 12.7, and height 6?',
      answerDisplay: '376.8 square units',
    },
  },
};

QUnit.module('generators/grade6/areaSurfaceVolume', () => {
  QUnit.test('every generator declares grade 6 and the areaSurfaceVolume topic', (assert) => {
    for (const gen of generators) {
      assert.equal(gen.grade, '6', `${gen.id} grade`);
      assert.equal(gen.topic, 'areaSurfaceVolume', `${gen.id} topic`);
    }
  });

  for (const [id, byDifficulty] of Object.entries(fixedSeedFixtures)) {
    for (const [difficulty, expected] of Object.entries(byDifficulty)) {
      QUnit.test(`${id} [${difficulty}] is deterministic for seed 12345`, (assert) => {
        const rng = createRng(12345);
        const problem = byId[id].generate({ difficulty, rng });
        assert.equal(problem.promptText, expected.promptText);
        assert.equal(problem.answerDisplay, expected.answerDisplay);
      });
    }
  }

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

  QUnit.test('all computed areas/volumes/surface areas are positive', (assert) => {
    for (const gen of generators) {
      for (const difficulty of gen.difficulties) {
        for (let seed = 0; seed < 50; seed++) {
          const rng = createRng(seed);
          const problem = gen.generate({ difficulty, rng });
          assert.ok(problem.answer > 0, `seed ${seed}/${difficulty}: positive answer for "${problem.promptText}"`);
        }
      }
    }
  });
});
