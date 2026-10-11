import { createRng } from '../../../js/core/rng.js';
import { generators } from '../../../js/generators/grade5/orderOfOperations.js';

const byId = Object.fromEntries(generators.map((g) => [g.id, g]));

QUnit.module('generators/grade5/orderOfOperations', () => {
  QUnit.test('every generator declares grade 5 and the orderOfOperations topic', (assert) => {
    for (const gen of generators) {
      assert.equal(gen.grade, '5', `${gen.id} grade`);
      assert.equal(gen.topic, 'orderOfOperations', `${gen.id} topic`);
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

  QUnit.test('evaluateExpression: the answer always matches evaluating the prompt literally', (assert) => {
    const gen = byId['grade5.orderOfOperations.evaluateExpression'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 80; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const { shape, a, b, c } = problem.meta;
        let expected;
        if (shape === 'addMul') expected = (a + b) * c;
        else if (shape === 'subMul') expected = (a - b) * c;
        else if (shape === 'mulAdd') expected = a * (b + c);
        else expected = (a + b) * c - problem.meta.d;
        assert.equal(problem.answer, expected, `[${difficulty}] seed ${seed}: ${problem.promptText}`);
      }
    }
  });

  QUnit.test('writeExpression: checkAnswer is flexible about spacing and ×/÷ vs */÷ but strict about structure', (assert) => {
    const gen = byId['grade5.orderOfOperations.writeExpression'];
    for (let seed = 0; seed < 60; seed++) {
      const rng = createRng(seed);
      const problem = gen.generate({ difficulty: 'medium', rng });
      assert.ok(problem.checkAnswer(problem.answerDisplay.replace(/\s+/g, '')), `seed ${seed}: accepts no spaces`);
      assert.ok(problem.checkAnswer(problem.answerDisplay.replace(/×/g, '*').replace(/÷/g, '/')), `seed ${seed}: accepts ASCII operators`);
      assert.notOk(problem.checkAnswer(`${problem.answerDisplay}9`), `seed ${seed}: rejects a structurally different expression`);
    }
  });

  QUnit.test('numericalPatterns: nth-term and relationship answers always match the underlying rules', (assert) => {
    const gen = byId['grade5.orderOfOperations.numericalPatterns'];
    const seenAsks = new Set();
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 100; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const { ask } = problem.meta;
        seenAsks.add(ask);
        if (ask === 'relationship') {
          const { stepA, stepB } = problem.meta;
          assert.equal(problem.answer, stepB / stepA, `[${difficulty}] seed ${seed}: relationship multiplier`);
        } else {
          const { step, termNumber } = problem.meta;
          assert.equal(problem.answer, step * (termNumber - 1), `[${difficulty}] seed ${seed}: nth term value`);
        }
      }
    }
    assert.ok(seenAsks.has('relationship') && (seenAsks.has('nthTermA') || seenAsks.has('nthTermB')), 'multiple question types were generated');
  });
});
