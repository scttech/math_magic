import { createRng } from '../../js/core/rng.js';
import { generators } from '../../js/generators/grade6/fractionsDecimals.js';

const byId = Object.fromEntries(generators.map((g) => [g.id, g]));

QUnit.module('generators/grade6/fractionsDecimals', () => {
  QUnit.test('every generator declares grade 6 and the fractionsDecimals topic', (assert) => {
    for (const gen of generators) {
      assert.equal(gen.grade, '6', `${gen.id} grade`);
      assert.equal(gen.topic, 'fractionsDecimals', `${gen.id} topic`);
      assert.ok(gen.id.startsWith('grade6.fractionsDecimals.'), `${gen.id} id prefix`);
    }
  });

  // Fixed-seed regression pins: same seed must always produce the same problem.
  // Captured by running the actual generator once (see: node generators with seed 12345).
  const fixedSeedFixtures = {
    'grade6.fractionsDecimals.addSubtractFractions': {
      easy: { promptText: '3/4 - 2/4 = ?', answerDisplay: '1/4' },
      medium: { promptText: '5/9 - 1/3 = ?', answerDisplay: '2/9' },
      hard: { promptText: '2 - 1 1/10 = ?', answerDisplay: '9/10' },
    },
    'grade6.fractionsDecimals.multiplyFractions': {
      easy: { promptText: '2/6 × 3/4 = ?', answerDisplay: '1/4' },
      medium: { promptText: '3/10 × 5/6 = ?', answerDisplay: '1/4' },
      hard: { promptText: '1/2 × 2 1/6 = ?', answerDisplay: '1 1/12' },
    },
    'grade6.fractionsDecimals.divideFractions': {
      easy: { promptText: '2/6 ÷ 3/4 = ?', answerDisplay: '4/9' },
      medium: { promptText: '3/10 ÷ 5/6 = ?', answerDisplay: '9/25' },
      hard: { promptText: '1/2 ÷ 2 1/6 = ?', answerDisplay: '3/13' },
    },
    'grade6.fractionsDecimals.addSubtractDecimals': {
      easy: { promptText: '19.6 + 6.1 = ?', answerDisplay: '25.7' },
      medium: { promptText: '19.60 + 6.13 = ?', answerDisplay: '25.73' },
      hard: { promptText: '195.95 + 61.35 = ?', answerDisplay: '257.30' },
    },
    'grade6.fractionsDecimals.multiplyDivideDecimals': {
      easy: { promptText: '40 ÷ 4 = ?', answerDisplay: '10' },
      medium: { promptText: '67.9 ÷ 7 = ?', answerDisplay: '9.7' },
      hard: { promptText: '6.79 ÷ 0.7 = ?', answerDisplay: '9.7' },
    },
    'grade6.fractionsDecimals.fractionDecimalConversion': {
      easy: { promptText: 'Write 3/10 as a decimal.', answerDisplay: '0.3' },
      medium: { promptText: 'Write 3/10 as a decimal.', answerDisplay: '0.3' },
      hard: { promptText: 'Write 8/25 as a decimal.', answerDisplay: '0.32' },
    },
  };

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

  // Property checks across many random seeds: checkAnswer must accept the
  // generator's own answer and reject an obviously wrong one.
  for (const gen of generators) {
    for (const difficulty of gen.difficulties) {
      QUnit.test(`${gen.id} [${difficulty}] checkAnswer accepts correct and rejects wrong answers`, (assert) => {
        for (let seed = 0; seed < 50; seed++) {
          const rng = createRng(seed);
          const problem = gen.generate({ difficulty, rng });
          assert.ok(
            problem.checkAnswer(problem.answerDisplay),
            `seed ${seed}: checkAnswer accepts its own answerDisplay "${problem.answerDisplay}" for "${problem.promptText}"`
          );
          assert.notOk(problem.checkAnswer('definitely-not-a-valid-answer'), `seed ${seed}: rejects garbage input`);
        }
      });
    }
  }

  QUnit.test('addSubtractFractions never produces a negative result', (assert) => {
    const gen = byId['grade6.fractionsDecimals.addSubtractFractions'];
    for (let seed = 0; seed < 100; seed++) {
      for (const difficulty of ['easy', 'medium', 'hard']) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        assert.ok(problem.answer.num >= 0, `seed ${seed}/${difficulty}: non-negative result`);
      }
    }
  });
});
