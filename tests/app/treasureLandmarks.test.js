import { createRng } from '../../js/core/rng.js';
import { LANDMARKS, createLandmarkSequence } from '../../js/app/treasureLandmarks.js';

QUnit.module('app/treasureLandmarks', () => {
  QUnit.test('every landmark has a name and an icon', (assert) => {
    for (const landmark of LANDMARKS) {
      assert.ok(typeof landmark.name === 'string' && landmark.name.length > 0, `"${landmark.name}" has a name`);
      assert.ok(typeof landmark.icon === 'string' && landmark.icon.length > 0, `"${landmark.name}" has an icon`);
    }
  });

  QUnit.test('no two landmarks share a name', (assert) => {
    const names = new Set(LANDMARKS.map((l) => l.name));
    assert.equal(names.size, LANDMARKS.length);
  });

  QUnit.test('there are enough landmarks to cover the game\'s largest "treasures to find" option without repeating', (assert) => {
    assert.ok(LANDMARKS.length >= 15, `LANDMARKS has ${LANDMARKS.length} entries, needs at least 15`);
  });

  QUnit.test('createLandmarkSequence draws every landmark exactly once per lap before any repeat', (assert) => {
    const sequence = createLandmarkSequence(createRng(1));
    const firstLap = new Set();
    for (let i = 0; i < LANDMARKS.length; i++) firstLap.add(sequence.next().name);
    assert.equal(firstLap.size, LANDMARKS.length, 'every landmark appeared exactly once in the first lap');

    const secondLap = new Set();
    for (let i = 0; i < LANDMARKS.length; i++) secondLap.add(sequence.next().name);
    assert.equal(secondLap.size, LANDMARKS.length, 'every landmark appeared exactly once in the second lap too');
  });

  QUnit.test('createLandmarkSequence never draws the same landmark twice in a row, even across a reshuffle boundary', (assert) => {
    for (let seed = 0; seed < 20; seed++) {
      const sequence = createLandmarkSequence(createRng(seed));
      let previous = null;
      for (let i = 0; i < LANDMARKS.length * 5; i++) {
        const current = sequence.next();
        if (previous) assert.notEqual(current.name, previous.name, `seed ${seed}, draw ${i}: no immediate repeat`);
        previous = current;
      }
    }
  });

  QUnit.test('createLandmarkSequence is deterministic for a given seed', (assert) => {
    const a = createLandmarkSequence(createRng(42));
    const b = createLandmarkSequence(createRng(42));
    for (let i = 0; i < LANDMARKS.length * 3; i++) {
      assert.equal(a.next().name, b.next().name);
    }
  });
});
