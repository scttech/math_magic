import { createRng } from '../../js/core/rng.js';
import { generators, buildHelpUrl } from '../../js/generators/grade6/wordProblems.js';
import { addUserTemplate } from '../../js/core/wordProblemTemplateStore.js';
import { hasHelp, buildHelpUrl as buildHelpUrlViaRegistry } from '../../js/core/helpRegistry.js';
import { getPatternById } from '../../js/core/wordProblemPatterns.js';

const wordProblemGenerator = generators[0];

QUnit.module('generators/grade6/wordProblems', (hooks) => {
  hooks.beforeEach(() => localStorage.clear());

  QUnit.test('declares grade 6 and the wordProblems topic', (assert) => {
    assert.equal(wordProblemGenerator.grade, '6');
    assert.equal(wordProblemGenerator.topic, 'wordProblems');
  });

  QUnit.test('generate produces a fully-rendered prompt with no leftover placeholder tags', (assert) => {
    for (let seed = 0; seed < 100; seed++) {
      const rng = createRng(seed);
      const problem = wordProblemGenerator.generate({ difficulty: 'medium', rng });
      assert.notOk(/<[^<>]+>/.test(problem.promptText), `seed ${seed}: no leftover tags in "${problem.promptText}"`);
      assert.ok(problem.checkAnswer(problem.answerDisplay), `seed ${seed}: checkAnswer accepts its own answer`);
      assert.equal(problem.meta.generatorId, wordProblemGenerator.id);
      assert.ok(getPatternById(problem.meta.patternId), `seed ${seed}: meta.patternId is a real pattern`);
      assert.ok(problem.meta.values && typeof problem.meta.values === 'object', `seed ${seed}: meta.values is present`);

      // explain() (used by the help page) must agree with the problem's own answer.
      const pattern = getPatternById(problem.meta.patternId);
      assert.equal(pattern.explain(problem.meta.values).finalAnswerDisplay, problem.answerDisplay, `seed ${seed}: explain() matches the generated answer`);
    }
  });

  QUnit.test('the word-problem generator is registered with the help system, and its URL round-trips the pattern and values', (assert) => {
    assert.ok(hasHelp(wordProblemGenerator.id));
    const rng = createRng(1);
    const problem = wordProblemGenerator.generate({ difficulty: 'medium', rng });

    const url = buildHelpUrl(problem);
    assert.equal(buildHelpUrlViaRegistry(problem), url, 'the registry dispatches to the same builder');

    const params = new URLSearchParams(url.split('?')[1]);
    assert.equal(params.get('type'), 'wordProblem');
    assert.equal(params.get('patternId'), problem.meta.patternId);
    assert.deepEqual(JSON.parse(params.get('values')), problem.meta.values);
    assert.equal(params.get('answer'), problem.answerDisplay);
  });

  QUnit.test('a user-added template becomes eligible for generation', (assert) => {
    addUserTemplate({
      patternId: 'multiplyRate',
      text: '<person> purchases <random_number_2_to_12:quantity> <object>s at $<amount:pricePerItem> each. Find the total.',
    });

    let sawCustomTemplate = false;
    for (let seed = 0; seed < 200 && !sawCustomTemplate; seed++) {
      const rng = createRng(seed);
      const problem = wordProblemGenerator.generate({ difficulty: 'medium', rng });
      if (problem.promptText.includes('purchases') && problem.promptText.includes('Find the total.')) {
        sawCustomTemplate = true;
      }
    }
    assert.ok(sawCustomTemplate, 'the custom template was selected at least once across 200 seeds');
  });
});
