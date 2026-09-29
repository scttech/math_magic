import { createRng } from '../../js/core/rng.js';
import { generators } from '../../js/generators/grade6/wordProblems.js';
import { addUserTemplate } from '../../js/core/wordProblemTemplateStore.js';

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
    }
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
