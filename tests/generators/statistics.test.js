import { createRng } from '../../js/core/rng.js';
import { generators } from '../../js/generators/grade6/statistics.js';

const byId = Object.fromEntries(generators.map((g) => [g.id, g]));

const fixedSeedFixtures = {
  'grade6.statistics.measuresOfCenter': {
    easy: { promptText: 'Find the range of this data set: 7, 10, 17, 11, 7', answerDisplay: '10' },
    medium: { promptText: 'Find the range of this data set: 13, 20, 33, 21, 14, 3', answerDisplay: '30' },
    hard: { promptText: 'Find the range of this data set: 19, 30, 50, 31, 21, 5, 46', answerDisplay: '45' },
  },
  'grade6.statistics.frequencyTableQuestions': {
    easy: {
      promptText: 'A survey recorded these responses and how often each occurred: 1 (7 times), 2 (5 times), 3 (3 times). Which response occurred most often?',
      answerDisplay: '1',
    },
    medium: {
      promptText:
        'A survey recorded these responses and how often each occurred: 1 (3 times), 2 (11 times), 3 (3 times), 4 (2 times). Which response occurred most often?',
      answerDisplay: '2',
    },
    hard: {
      promptText:
        'A survey recorded these responses and how often each occurred: 1 (3 times), 2 (14 times), 3 (3 times), 4 (2 times), 5 (1 times). Which response occurred most often?',
      answerDisplay: '2',
    },
  },
  'grade6.statistics.missingValueGivenMean': {
    easy: { promptText: 'The mean of 4 numbers is 15. 3 of the numbers are: 9, 26, 10. What is the missing number?', answerDisplay: '15' },
    medium: {
      promptText: 'The mean of 5 numbers is 15. 4 of the numbers are: 15, 25, 13, 13. What is the missing number?',
      answerDisplay: '9',
    },
    hard: {
      promptText: 'The mean of 6 numbers is 25. 5 of the numbers are: 15, 24, 41, 25, 30. What is the missing number?',
      answerDisplay: '15',
    },
  },
};

QUnit.module('generators/grade6/statistics', () => {
  QUnit.test('every generator declares grade 6 and the statistics topic', (assert) => {
    for (const gen of generators) {
      assert.equal(gen.grade, '6', `${gen.id} grade`);
      assert.equal(gen.topic, 'statistics', `${gen.id} topic`);
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

  QUnit.test('missingValueGivenMean never produces a negative missing value', (assert) => {
    const gen = byId['grade6.statistics.missingValueGivenMean'];
    for (let seed = 0; seed < 200; seed++) {
      for (const difficulty of gen.difficulties) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        assert.ok(problem.answer >= 0, `seed ${seed}/${difficulty}: non-negative missing value`);
      }
    }
  });
});
