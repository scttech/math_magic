import { createRng } from '../../js/core/rng.js';
import { fallSpeedForScore, isPointInCircle, layoutStartPositions, BASE_FALL_SPEED, SPEED_RAMP_PER_CORRECT, MAX_FALL_SPEED } from '../../js/game/blasterEngine.js';

QUnit.module('game/blasterEngine', () => {
  QUnit.test('fallSpeedForScore starts at the base speed and ramps up with score', (assert) => {
    assert.equal(fallSpeedForScore(0), BASE_FALL_SPEED);
    assert.equal(fallSpeedForScore(1), BASE_FALL_SPEED + SPEED_RAMP_PER_CORRECT);
    assert.equal(fallSpeedForScore(5), BASE_FALL_SPEED + 5 * SPEED_RAMP_PER_CORRECT);
  });

  QUnit.test('fallSpeedForScore never exceeds the max speed', (assert) => {
    assert.equal(fallSpeedForScore(1000), MAX_FALL_SPEED);
  });

  QUnit.test('isPointInCircle accepts points inside or on the edge, rejects points outside', (assert) => {
    assert.ok(isPointInCircle(100, 100, 100, 100, 10), 'dead center');
    assert.ok(isPointInCircle(108, 100, 100, 100, 10), 'inside');
    assert.ok(isPointInCircle(110, 100, 100, 100, 10), 'exactly on the edge');
    assert.notOk(isPointInCircle(115, 100, 100, 100, 10), 'outside');
    assert.notOk(isPointInCircle(100, 0, 100, 100, 10), 'far above');
  });

  QUnit.test('layoutStartPositions returns one position per item, spread across the width within the margins', (assert) => {
    for (let seed = 0; seed < 50; seed++) {
      const rng = createRng(seed);
      const positions = layoutStartPositions(rng, 4, 640, 40);
      assert.equal(positions.length, 4, `seed ${seed}: one position per item`);
      for (const x of positions) {
        assert.ok(x >= 0 && x <= 640, `seed ${seed}: position ${x} stays within the canvas width`);
      }
      // Roughly ascending left-to-right despite jitter.
      assert.ok(positions[0] < positions[3], `seed ${seed}: first slot is left of the last slot`);
    }
  });

  QUnit.test('layoutStartPositions is deterministic for a given seed', (assert) => {
    const a = layoutStartPositions(createRng(7), 4, 640, 40);
    const b = layoutStartPositions(createRng(7), 4, 640, 40);
    assert.deepEqual(a, b);
  });
});
