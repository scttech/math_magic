import { createRng } from '../../js/core/rng.js';
import { generators } from '../../js/generators/grade6/negativeNumbers.js';

const byId = Object.fromEntries(generators.map((g) => [g.id, g]));

const fixedSeedFixtures = {
  'grade6.negativeNumbers.compareIntegers': {
    easy: { promptText: 'Compare: 10 ___ -4 (use <, >, or =)', answerDisplay: '>' },
    medium: { promptText: 'Compare: 24 ___ -10 (use <, >, or =)', answerDisplay: '>' },
    hard: { promptText: 'Compare: 58 ___ -23 (use <, >, or =)', answerDisplay: '>' },
  },
  'grade6.negativeNumbers.absoluteValue': {
    easy: { promptText: 'What is |12|?', answerDisplay: '12' },
    medium: { promptText: 'What is |29|?', answerDisplay: '29' },
    hard: { promptText: 'What is |72|?', answerDisplay: '72' },
  },
  'grade6.negativeNumbers.addSubtractIntegers': {
    easy: { promptText: '12 + (-5) = ?', answerDisplay: '7' },
    medium: { promptText: '29 + (-12) = ?', answerDisplay: '17' },
    hard: { promptText: '58 + (-23) = ?', answerDisplay: '35' },
  },
  'grade6.negativeNumbers.multiplyDivideIntegers': {
    easy: { promptText: '40 ÷ 8 = ?', answerDisplay: '5' },
    medium: { promptText: '70 ÷ 10 = ?', answerDisplay: '7' },
    hard: { promptText: '104 ÷ 13 = ?', answerDisplay: '8' },
  },
  'grade6.negativeNumbers.numberLineWordProblem': {
    easy: { promptText: 'A bank account balance was -6 dollars. It increased by 7 dollars. What is the new value?', answerDisplay: '1' },
    medium: {
      promptText: 'A bank account balance was -16 dollars. It decreased by 1 dollars. What is the new value?',
      answerDisplay: '-17',
    },
    hard: {
      promptText: 'A bank account balance was -39 dollars. It decreased by 2 dollars. What is the new value?',
      answerDisplay: '-41',
    },
  },
};

QUnit.module('generators/grade6/negativeNumbers', () => {
  QUnit.test('every generator declares grade 6 and the negativeNumbers topic', (assert) => {
    for (const gen of generators) {
      assert.equal(gen.grade, '6', `${gen.id} grade`);
      assert.equal(gen.topic, 'negativeNumbers', `${gen.id} topic`);
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

  QUnit.test('multiplyDivideIntegers division always divides evenly', (assert) => {
    const gen = byId['grade6.negativeNumbers.multiplyDivideIntegers'];
    for (let seed = 0; seed < 100; seed++) {
      for (const difficulty of gen.difficulties) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        if (problem.promptText.includes('÷')) {
          assert.ok(Number.isInteger(problem.answer), `seed ${seed}/${difficulty}: integer quotient for "${problem.promptText}"`);
        }
      }
    }
  });
});
