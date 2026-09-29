import { createRng } from '../../js/core/rng.js';
import { WORD_PROBLEM_PATTERNS, getPatternById } from '../../js/core/wordProblemPatterns.js';
import { validateTemplateText, renderTemplate } from '../../js/core/wordProblemTemplateEngine.js';

const wordLists = { person: ['Carter', 'Maya'], food: ['bananas', 'apples'], object: ['marble', 'sticker'] };

QUnit.module('core/wordProblemPatterns', () => {
  QUnit.test('every pattern has a unique id and at least one built-in template', (assert) => {
    const ids = WORD_PROBLEM_PATTERNS.map((p) => p.id);
    assert.equal(new Set(ids).size, ids.length, 'ids are unique');
    for (const pattern of WORD_PROBLEM_PATTERNS) {
      assert.ok(pattern.defaultTemplates.length > 0, `${pattern.id} ships at least one template`);
    }
  });

  QUnit.test('getPatternById finds a real pattern and returns null for an unknown id', (assert) => {
    assert.equal(getPatternById('combineThenRemove').id, 'combineThenRemove');
    assert.equal(getPatternById('nope'), null);
  });

  QUnit.test("every pattern's built-in templates satisfy its own required roles", (assert) => {
    for (const pattern of WORD_PROBLEM_PATTERNS) {
      for (const text of pattern.defaultTemplates) {
        const result = validateTemplateText(text, pattern);
        assert.ok(result.valid, `${pattern.id}: ${result.errors.join('; ')}`);
      }
    }
  });

  QUnit.test('combineThenRemove always answers a non-negative amount, and checkAnswer round-trips', (assert) => {
    const pattern = getPatternById('combineThenRemove');
    for (let seed = 0; seed < 300; seed++) {
      const rng = createRng(seed);
      const { answer, answerDisplay, checkAnswer } = renderTemplate({ text: pattern.defaultTemplates[0], pattern, rng, difficulty: 'medium', wordLists });
      assert.ok(answer.num >= 0, `seed ${seed}: non-negative remaining amount (${answerDisplay})`);
      assert.ok(checkAnswer(answerDisplay), `seed ${seed}: checkAnswer accepts its own answerDisplay`);
      assert.notOk(checkAnswer('9999/2'), `seed ${seed}: checkAnswer rejects an implausible answer`);
    }
  });

  QUnit.test('multiplyRate: price reads as a real decimal amount, and checkAnswer accepts the computed total', (assert) => {
    const pattern = getPatternById('multiplyRate');
    for (let seed = 0; seed < 100; seed++) {
      const rng = createRng(seed);
      const { promptText, checkAnswer, answerDisplay } = renderTemplate({ text: pattern.defaultTemplates[0], pattern, rng, difficulty: 'easy', wordLists });
      assert.ok(/\$\d+\.\d{2}/.test(promptText), `seed ${seed}: price looks like real money, not a fraction (${promptText})`);
      assert.notOk(/\$\d+ \d+\/\d+/.test(promptText), `seed ${seed}: price is not rendered as a mixed number (${promptText})`);
      assert.ok(checkAnswer(answerDisplay), `seed ${seed}: ${promptText} -> ${answerDisplay}`);
    }
  });

  QUnit.test('compareTotals never answers zero (equal amounts are nudged apart)', (assert) => {
    const pattern = getPatternById('compareTotals');
    for (let seed = 0; seed < 200; seed++) {
      const rng = createRng(seed);
      const { answer, answerDisplay, checkAnswer } = renderTemplate({ text: pattern.defaultTemplates[0], pattern, rng, difficulty: 'medium', wordLists });
      assert.ok(answer.num > 0, `seed ${seed}: positive difference (${answerDisplay})`);
      assert.ok(checkAnswer(answerDisplay));
    }
  });

  QUnit.test('divideShare: checkAnswer accepts the computed share for its own template', (assert) => {
    const pattern = getPatternById('divideShare');
    for (let seed = 0; seed < 100; seed++) {
      const rng = createRng(seed);
      const { checkAnswer, answerDisplay } = renderTemplate({ text: pattern.defaultTemplates[0], pattern, rng, difficulty: 'hard', wordLists });
      assert.ok(checkAnswer(answerDisplay));
    }
  });

  QUnit.test("every pattern's explain() agrees with compute() on the final answer, and returns non-empty steps", (assert) => {
    for (const pattern of WORD_PROBLEM_PATTERNS) {
      for (let seed = 0; seed < 50; seed++) {
        const rng = createRng(seed * 17 + 3);
        const { values, answerDisplay } = renderTemplate({ text: pattern.defaultTemplates[0], pattern, rng, difficulty: 'medium', wordLists });
        const { strategy, workedSteps, finalAnswerDisplay } = pattern.explain(values);
        assert.ok(strategy.length > 0, `${pattern.id} seed ${seed}: strategy has steps`);
        assert.ok(workedSteps.length > 0, `${pattern.id} seed ${seed}: workedSteps has steps`);
        assert.ok(
          strategy.every((s) => typeof s === 'string' && s.length > 0) && workedSteps.every((s) => typeof s === 'string' && s.length > 0),
          `${pattern.id} seed ${seed}: every step is a non-empty string`
        );
        assert.equal(finalAnswerDisplay, answerDisplay, `${pattern.id} seed ${seed}: explain()'s final answer matches compute()'s`);
      }
    }
  });
});
