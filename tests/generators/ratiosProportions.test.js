import { createRng } from '../../js/core/rng.js';
import { generators } from '../../js/generators/grade6/ratiosProportions.js';

const byId = Object.fromEntries(generators.map((g) => [g.id, g]));

const fixedSeedFixtures = {
  'grade6.ratiosProportions.simplifyRatio': {
    easy: { promptText: 'Simplify the ratio 10:15 to lowest terms.', answerDisplay: '2:3' },
    medium: { promptText: 'Simplify the ratio 36:45 to lowest terms.', answerDisplay: '4:5' },
    hard: { promptText: 'Simplify the ratio 60:96 to lowest terms.', answerDisplay: '5:8' },
  },
  'grade6.ratiosProportions.solveProportion': {
    easy: { promptText: '6/2 = 18/x. What is x?', answerDisplay: '6' },
    medium: { promptText: '10/4 = 50/x. What is x?', answerDisplay: '20' },
    hard: { promptText: '15/5 = 105/x. What is x?', answerDisplay: '35' },
  },
  'grade6.ratiosProportions.unitRateWordProblem': {
    easy: {
      promptText: 'A painter uses 3 gallons of paint for every 3 walls. How many gallons of paint are needed for 9 walls?',
      answerDisplay: '9',
    },
    medium: {
      promptText: 'A painter uses 4 gallons of paint for every 4 walls. How many gallons of paint are needed for 24 walls?',
      answerDisplay: '24',
    },
    hard: {
      promptText: 'A painter uses 6 gallons of paint for every 6 walls. How many gallons of paint are needed for 54 walls?',
      answerDisplay: '54',
    },
  },
};

QUnit.module('generators/grade6/ratiosProportions', () => {
  QUnit.test('every generator declares grade 6 and the ratiosProportions topic', (assert) => {
    for (const gen of generators) {
      assert.equal(gen.grade, '6', `${gen.id} grade`);
      assert.equal(gen.topic, 'ratiosProportions', `${gen.id} topic`);
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

  QUnit.test('unitRateWordProblem never produces a singular-looking count', (assert) => {
    const gen = byId['grade6.ratiosProportions.unitRateWordProblem'];
    for (let seed = 0; seed < 200; seed++) {
      for (const difficulty of gen.difficulties) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const firstClause = problem.promptText.split(' for every ')[0];
        assert.notOk(/\s1\s/.test(firstClause), `seed ${seed}/${difficulty}: "${firstClause}" should not read "1 <unit>"`);
      }
    }
  });
});
