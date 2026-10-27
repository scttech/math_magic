import { getBubbleCount, setBubbleCount, MIN_BUBBLE_COUNT, MAX_BUBBLE_COUNT, DEFAULT_BUBBLE_COUNT } from '../../js/app/blasterSettings.js';

QUnit.module('app/blasterSettings', (hooks) => {
  hooks.beforeEach(() => localStorage.clear());

  QUnit.test('defaults to DEFAULT_BUBBLE_COUNT when nothing has been stored yet', (assert) => {
    assert.equal(getBubbleCount(), DEFAULT_BUBBLE_COUNT);
  });

  QUnit.test('setBubbleCount persists and is reflected by getBubbleCount', (assert) => {
    setBubbleCount(6);
    assert.equal(getBubbleCount(), 6);
  });

  QUnit.test('setBubbleCount clamps to [MIN_BUBBLE_COUNT, MAX_BUBBLE_COUNT]', (assert) => {
    setBubbleCount(1);
    assert.equal(getBubbleCount(), MIN_BUBBLE_COUNT);

    setBubbleCount(100);
    assert.equal(getBubbleCount(), MAX_BUBBLE_COUNT);
  });

  QUnit.test('setBubbleCount rounds a non-integer to the nearest whole bubble', (assert) => {
    setBubbleCount(5.6);
    assert.equal(getBubbleCount(), 6);
  });

  QUnit.test('getBubbleCount falls back to the default if storage holds a corrupt/out-of-range value', (assert) => {
    localStorage.setItem('mathmagic.blasterBubbleCount', 'not-a-number');
    assert.equal(getBubbleCount(), DEFAULT_BUBBLE_COUNT);

    localStorage.setItem('mathmagic.blasterBubbleCount', '99');
    assert.equal(getBubbleCount(), DEFAULT_BUBBLE_COUNT);
  });
});
