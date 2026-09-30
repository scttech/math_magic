import { createRng } from '../../js/core/rng.js';
import { generators } from '../../js/generators/grade6/rationalIrrational.js';

const byId = Object.fromEntries(generators.map((g) => [g.id, g]));

QUnit.module('generators/grade6/rationalIrrational', () => {
  QUnit.test('every generator declares grade 6 and the rationalIrrational topic', (assert) => {
    for (const gen of generators) {
      assert.equal(gen.grade, '6', `${gen.id} grade`);
      assert.equal(gen.topic, 'rationalIrrational', `${gen.id} topic`);
      assert.ok(gen.id.startsWith('grade6.rationalIrrational.'), `${gen.id} id prefix`);
    }
  });

  QUnit.test('classify: labels every generated number Rational or Irrational, and checkAnswer is exact', (assert) => {
    const gen = byId['grade6.rationalIrrational.classify'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 100; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        assert.ok(['Rational', 'Irrational'].includes(problem.answerDisplay), `[${difficulty}] seed ${seed}: answer is Rational or Irrational`);
        assert.ok(problem.checkAnswer(problem.answerDisplay), `[${difficulty}] seed ${seed}: checkAnswer accepts the correct label`);
        assert.ok(problem.checkAnswer(problem.answerDisplay.toLowerCase()), `[${difficulty}] seed ${seed}: checkAnswer is case-insensitive`);
        const wrong = problem.answerDisplay === 'Rational' ? 'Irrational' : 'Rational';
        assert.notOk(problem.checkAnswer(wrong), `[${difficulty}] seed ${seed}: checkAnswer rejects the opposite label`);
      }
    }
  });

  QUnit.test('classify: a perfect-square root is always labeled Rational, and a non-perfect-square root is always labeled Irrational', (assert) => {
    const gen = byId['grade6.rationalIrrational.classify'];
    for (let seed = 0; seed < 300; seed++) {
      const rng = createRng(seed);
      const problem = gen.generate({ difficulty: 'medium', rng });
      const match = /^√(\d+)$/.exec(problem.meta.display);
      if (!match) continue;
      const radicand = Number(match[1]);
      const root = Math.sqrt(radicand);
      const isPerfectSquare = Number.isInteger(root);
      assert.equal(problem.answerDisplay, isPerfectSquare ? 'Rational' : 'Irrational', `seed ${seed}: √${radicand} classified correctly`);
    }
  });

  QUnit.test('simplifySquareRoot: the answer squared always equals the radicand', (assert) => {
    const gen = byId['grade6.rationalIrrational.simplifySquareRoot'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 60; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        assert.equal(problem.answer * problem.answer, problem.meta.square, `[${difficulty}] seed ${seed}: root squared equals ${problem.meta.square}`);
        assert.ok(problem.checkAnswer(problem.answerDisplay), `[${difficulty}] seed ${seed}: checkAnswer accepts its own answer`);
      }
    }
  });

  QUnit.test('estimateSquareRoot: the two bounds are consecutive integers that truly bracket the root, and checkAnswer is order/format-flexible', (assert) => {
    const gen = byId['grade6.rationalIrrational.estimateSquareRoot'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 80; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const [lower, upper] = problem.answer;
        assert.equal(upper, lower + 1, `[${difficulty}] seed ${seed}: bounds are consecutive`);
        assert.ok(lower * lower < problem.meta.n && problem.meta.n < upper * upper, `[${difficulty}] seed ${seed}: bounds truly bracket ${problem.meta.n}`);
        assert.ok(problem.checkAnswer(`${lower} and ${upper}`), `[${difficulty}] seed ${seed}: accepts "lower and upper"`);
        assert.ok(problem.checkAnswer(`${upper}, ${lower}`), `[${difficulty}] seed ${seed}: accepts either order`);
        assert.ok(problem.checkAnswer(`between ${lower} and ${upper}`), `[${difficulty}] seed ${seed}: accepts extra words`);
        assert.ok(problem.checkAnswer(`${lower}-${upper}`), `[${difficulty}] seed ${seed}: accepts a bare hyphen range like "4-5", not misread as a negative number`);
        assert.notOk(problem.checkAnswer(`${lower}`), `[${difficulty}] seed ${seed}: rejects a single number`);
        assert.notOk(problem.checkAnswer(`${lower - 1} and ${upper}`), `[${difficulty}] seed ${seed}: rejects the wrong bounds`);
      }
    }
  });

  QUnit.test('compareValues: the comparison symbol is always correct and never ambiguous, and checkAnswer is exact', (assert) => {
    const gen = byId['grade6.rationalIrrational.compareValues'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 100; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const actualRoot = Math.sqrt(problem.meta.n);
        const expectedSymbol = actualRoot < problem.meta.decimalValue ? '<' : actualRoot > problem.meta.decimalValue ? '>' : '=';
        assert.equal(problem.answerDisplay, expectedSymbol, `[${difficulty}] seed ${seed}: symbol matches the true comparison`);
        assert.ok(problem.meta.decimalValue > 0, `[${difficulty}] seed ${seed}: decimal side stays positive`);
        assert.ok(problem.checkAnswer(problem.answerDisplay), `[${difficulty}] seed ${seed}: checkAnswer accepts the correct symbol`);
        for (const wrongSymbol of ['<', '>', '='].filter((s) => s !== problem.answerDisplay)) {
          assert.notOk(problem.checkAnswer(wrongSymbol), `[${difficulty}] seed ${seed}: checkAnswer rejects "${wrongSymbol}"`);
        }
      }
    }
  });
});
