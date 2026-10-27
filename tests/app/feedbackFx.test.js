import { isSoundEnabled, setSoundEnabled } from '../../js/app/feedbackFx.js';

QUnit.module('app/feedbackFx', (hooks) => {
  hooks.beforeEach(() => localStorage.clear());

  QUnit.test('sound is enabled by default when nothing has been stored yet', (assert) => {
    assert.ok(isSoundEnabled());
  });

  QUnit.test('setSoundEnabled persists and is reflected by isSoundEnabled', (assert) => {
    setSoundEnabled(false);
    assert.notOk(isSoundEnabled());

    setSoundEnabled(true);
    assert.ok(isSoundEnabled());
  });
});
