import {
  pickGoodCelebration,
  pickEncouragementCelebration,
  pickCelebrationForAccuracy,
  pickCelebrationForOutcome,
  showCelebration,
  MAZE_ESCAPED_IMAGE,
  GOOD_ACCURACY_THRESHOLD,
} from '../../js/app/celebrations.js';

QUnit.module('app/celebrations', () => {
  QUnit.test('pickGoodCelebration always returns one of the known good images', (assert) => {
    for (let i = 0; i < 20; i++) {
      const src = pickGoodCelebration();
      assert.ok(typeof src === 'string' && src.endsWith('.png'), `pick ${i}: "${src}" looks like an image path`);
      assert.notEqual(src, MAZE_ESCAPED_IMAGE, 'the maze-specific image is never picked for the generic good pool');
    }
  });

  QUnit.test('pickEncouragementCelebration always returns one of the known encouragement images', (assert) => {
    for (let i = 0; i < 20; i++) {
      const src = pickEncouragementCelebration();
      assert.ok(typeof src === 'string' && src.endsWith('.png'), `pick ${i}: "${src}" looks like an image path`);
    }
  });

  QUnit.test('the good and encouragement pools never share an image', (assert) => {
    const good = new Set();
    const encouragement = new Set();
    for (let i = 0; i < 50; i++) {
      good.add(pickGoodCelebration());
      encouragement.add(pickEncouragementCelebration());
    }
    for (const src of good) assert.notOk(encouragement.has(src), `"${src}" is not in both pools`);
  });

  QUnit.test('pickCelebrationForAccuracy picks a good image at or above the threshold', (assert) => {
    assert.ok(pickCelebrationForAccuracy(GOOD_ACCURACY_THRESHOLD));
    assert.ok(pickCelebrationForAccuracy(1));
  });

  QUnit.test('pickCelebrationForAccuracy picks an encouragement image below the threshold', (assert) => {
    assert.ok(pickCelebrationForAccuracy(GOOD_ACCURACY_THRESHOLD - 0.01));
    assert.ok(pickCelebrationForAccuracy(0));
  });

  QUnit.test('pickCelebrationForOutcome treats a win or tie as good, a loss as encouragement', (assert) => {
    assert.ok(pickCelebrationForOutcome('win'));
    assert.ok(pickCelebrationForOutcome('tie'));
    assert.ok(pickCelebrationForOutcome('loss'));
  });

  QUnit.test('showCelebration sets the src and un-hides the element when given an image', (assert) => {
    const img = document.createElement('img');
    img.hidden = true;
    showCelebration(img, '../assets/images/celebrations/great-job.png');
    assert.notOk(img.hidden);
    assert.ok(img.src.endsWith('/assets/images/celebrations/great-job.png'));
  });

  QUnit.test('showCelebration hides the element and clears its src when given nothing to show', (assert) => {
    const img = document.createElement('img');
    img.src = '../assets/images/celebrations/great-job.png';
    img.hidden = false;
    showCelebration(img, null);
    assert.ok(img.hidden);
    assert.notOk(img.getAttribute('src'));
  });

  QUnit.test('showCelebration tolerates a missing element (an optional celebrationImage not configured)', (assert) => {
    showCelebration(null, '../assets/images/celebrations/great-job.png');
    assert.ok(true, 'did not throw');
  });
});
