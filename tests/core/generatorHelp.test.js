// Exercises every registered generator's explain() (the Help system's content
// source) uniformly, rather than one bespoke test per generator: for each one
// that defines explain(), across every difficulty and many seeds, its worked
// solution must agree with the actual generated answer and return real steps.
import '../../js/generators/grade6/index.js';
import { createRng } from '../../js/core/rng.js';
import { getAll } from '../../js/core/registry.js';

QUnit.module('generators/help (explain coverage)', () => {
  const generatorsWithHelp = getAll().filter((g) => typeof g.explain === 'function');

  QUnit.test('grade-6 content has broad help coverage', (assert) => {
    assert.ok(generatorsWithHelp.length >= 20, `expected help on most generators, found ${generatorsWithHelp.length}`);
  });

  for (const generatorModule of generatorsWithHelp) {
    QUnit.test(`${generatorModule.id}: explain() matches the generated answer and returns real steps, across every difficulty and many seeds`, (assert) => {
      for (const difficulty of generatorModule.difficulties) {
        for (let seed = 0; seed < 40; seed++) {
          const rng = createRng(seed * 97 + difficulty.length);
          const problem = generatorModule.generate({ difficulty, rng });
          const help = generatorModule.explain(problem.meta);

          assert.equal(help.finalAnswerDisplay, problem.answerDisplay, `[${difficulty}] seed ${seed}: finalAnswerDisplay matches`);
          assert.ok(Array.isArray(help.strategy) && help.strategy.length > 0, `[${difficulty}] seed ${seed}: has strategy steps`);
          assert.ok(Array.isArray(help.workedSteps) && help.workedSteps.length > 0, `[${difficulty}] seed ${seed}: has worked steps`);
          assert.ok(
            help.strategy.every((s) => typeof s === 'string' && s.length > 0) && help.workedSteps.every((s) => typeof s === 'string' && s.length > 0),
            `[${difficulty}] seed ${seed}: every step is a non-empty string`
          );
        }
      }
    });
  }
});
