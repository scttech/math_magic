import { createRng, randomInt, shuffle } from '../../js/core/rng.js';

QUnit.module('core/rng', () => {
  QUnit.test('same seed produces the same sequence', (assert) => {
    const rngA = createRng(12345);
    const rngB = createRng(12345);
    const sequenceA = Array.from({ length: 5 }, () => rngA());
    const sequenceB = Array.from({ length: 5 }, () => rngB());
    assert.deepEqual(sequenceA, sequenceB);
  });

  QUnit.test('different seeds produce different sequences', (assert) => {
    const rngA = createRng(1);
    const rngB = createRng(2);
    assert.notDeepEqual(
      Array.from({ length: 5 }, () => rngA()),
      Array.from({ length: 5 }, () => rngB())
    );
  });

  QUnit.test('values stay within [0, 1)', (assert) => {
    const rng = createRng(42);
    for (let i = 0; i < 1000; i++) {
      const value = rng();
      assert.ok(value >= 0 && value < 1, `value ${value} in range`);
    }
  });

  QUnit.test('randomInt stays within [min, max] inclusive', (assert) => {
    const rng = createRng(7);
    for (let i = 0; i < 200; i++) {
      const value = randomInt(rng, 3, 8);
      assert.ok(value >= 3 && value <= 8, `value ${value} in [3,8]`);
    }
  });

  QUnit.test('shuffle returns a permutation without mutating the input', (assert) => {
    const rng = createRng(99);
    const original = [1, 2, 3, 4, 5];
    const copy = original.slice();
    const shuffled = shuffle(rng, original);
    assert.deepEqual(original, copy, 'input array unmutated');
    assert.deepEqual(shuffled.slice().sort(), original.slice().sort(), 'same elements');
  });
});
