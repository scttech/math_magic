import { createRng } from '../../js/core/rng.js';
import { buildChoiceSet } from '../../js/skills/numericChoices.js';

QUnit.module('skills/numericChoices', () => {
  QUnit.test('returns 4 unique choices including the correct answer, for many seeds and candidate shapes', (assert) => {
    for (let seed = 0; seed < 200; seed++) {
      const rng = createRng(seed);
      const correct = 7;
      const candidates = [7 * 3, Math.abs(7 - 3), correct + 1, correct - 1, correct + 2, correct - 2, correct + 10, correct - 10];
      const choices = buildChoiceSet(rng, correct, candidates);
      assert.equal(choices.length, 4, `seed ${seed}: 4 choices`);
      assert.equal(new Set(choices).size, 4, `seed ${seed}: choices are unique`);
      assert.ok(choices.includes(String(correct)), `seed ${seed}: choices include the correct answer`);
      for (const choice of choices) {
        assert.ok(Number(choice) >= 0, `seed ${seed}: choice ${choice} respects the default min of 0`);
      }
    }
  });

  QUnit.test('tops up with random nearby offsets when there are too few valid candidates', (assert) => {
    const rng = createRng(1);
    const choices = buildChoiceSet(rng, 0, []);
    assert.equal(choices.length, 4);
    assert.equal(new Set(choices).size, 4);
    assert.ok(choices.includes('0'));
  });

  QUnit.test('respects a custom min bound, excluding candidates below it', (assert) => {
    const rng = createRng(3);
    const choices = buildChoiceSet(rng, 5, [4, 6, 3, 7], 5);
    for (const choice of choices) {
      assert.ok(Number(choice) >= 5, `choice ${choice} respects the min of 5`);
    }
  });
});
