import '../../../js/generators/grade5/index.js';
import { createRng } from '../../../js/core/rng.js';
import { generators } from '../../../js/generators/grade5/wordProblems.js';
import { addUserTemplate } from '../../../js/core/wordProblemTemplateStore.js';
import { hasHelp, buildHelpUrl } from '../../../js/core/helpRegistry.js';
import { getPatternById } from '../../../js/core/wordProblemPatterns.js';

const wordProblemGenerator = generators[0];

QUnit.module('generators/grade5/wordProblems', (hooks) => {
  hooks.beforeEach(() => localStorage.clear());

  QUnit.test('declares grade 5 and the wordProblems topic', (assert) => {
    assert.equal(wordProblemGenerator.grade, '5');
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

      const pattern = getPatternById(problem.meta.patternId);
      assert.equal(pattern.explain(problem.meta.values).finalAnswerDisplay, problem.answerDisplay, `seed ${seed}: pattern.explain() matches the generated answer`);
      assert.equal(wordProblemGenerator.explain(problem.meta).finalAnswerDisplay, problem.answerDisplay, `seed ${seed}: generator.explain() matches the generated answer`);
    }
  });

  QUnit.test('draws from the full shared pattern pool, not just a subset', (assert) => {
    const seenPatternIds = new Set();
    for (let seed = 0; seed < 300; seed++) {
      const rng = createRng(seed);
      const problem = wordProblemGenerator.generate({ difficulty: 'medium', rng });
      seenPatternIds.add(problem.meta.patternId);
    }
    for (const id of ['combineThenRemove', 'multiplyRate', 'compareTotals', 'divideShare', 'wholeNumberProduct', 'boxVolume', 'decimalDifference', 'convertMetersCentimeters']) {
      assert.ok(seenPatternIds.has(id), `saw at least one "${id}" problem across 300 seeds`);
    }
  });

  QUnit.test('the word-problem generator is auto-detected by the help system, and its URL round-trips generatorId/meta', (assert) => {
    assert.ok(hasHelp(wordProblemGenerator.id));
    const rng = createRng(1);
    const problem = wordProblemGenerator.generate({ difficulty: 'medium', rng });

    const url = buildHelpUrl(problem);
    const params = new URLSearchParams(url.split('?')[1]);
    assert.equal(params.get('generatorId'), wordProblemGenerator.id);
    assert.deepEqual(JSON.parse(params.get('meta')), problem.meta);
    assert.equal(params.get('answer'), problem.answerDisplay);
  });

  QUnit.test('a user-added template becomes eligible for generation', (assert) => {
    addUserTemplate({
      patternId: 'wholeNumberProduct',
      text: '<person> stacks <object>s into <random_number_4_to_20:groups> piles of <random_number_6_to_50:perGroup>. Find the total.',
    });

    let sawCustomTemplate = false;
    for (let seed = 0; seed < 200 && !sawCustomTemplate; seed++) {
      const rng = createRng(seed);
      const problem = wordProblemGenerator.generate({ difficulty: 'medium', rng });
      if (problem.promptText.includes('stacks') && problem.promptText.includes('Find the total.')) {
        sawCustomTemplate = true;
      }
    }
    assert.ok(sawCustomTemplate, 'the custom template was selected at least once across 200 seeds');
  });
});
