import { recordLogin, getLoginDates, MAX_TRACKED_LOGINS } from '../../js/core/loginHistory.js';

QUnit.module('core/loginHistory', (hooks) => {
  hooks.beforeEach(() => localStorage.clear());

  QUnit.test('getLoginDates is empty for a profile with no recorded logins', (assert) => {
    assert.deepEqual(getLoginDates('profile_x'), []);
  });

  QUnit.test('recordLogin adds today\'s date', (assert) => {
    const dates = recordLogin('profile_x', new Date('2026-01-15T12:00:00Z'));
    assert.deepEqual(dates, ['2026-01-15']);
    assert.deepEqual(getLoginDates('profile_x'), ['2026-01-15']);
  });

  QUnit.test('recordLogin is idempotent within the same day', (assert) => {
    recordLogin('profile_x', new Date('2026-01-15T08:00:00Z'));
    const dates = recordLogin('profile_x', new Date('2026-01-15T20:00:00Z'));
    assert.deepEqual(dates, ['2026-01-15']);
  });

  QUnit.test('recordLogin appends a new entry for a different day', (assert) => {
    recordLogin('profile_x', new Date('2026-01-15T00:00:00Z'));
    const dates = recordLogin('profile_x', new Date('2026-01-16T00:00:00Z'));
    assert.deepEqual(dates, ['2026-01-15', '2026-01-16']);
  });

  QUnit.test('recordLogin only tracks the most recent MAX_TRACKED_LOGINS days', (assert) => {
    let dates;
    for (let day = 1; day <= MAX_TRACKED_LOGINS + 5; day++) {
      dates = recordLogin('profile_x', new Date(Date.UTC(2026, 0, day)));
    }
    assert.equal(dates.length, MAX_TRACKED_LOGINS);
    assert.equal(dates[0], '2026-01-06', 'the oldest entries fell off the front');
    assert.equal(dates[dates.length - 1], `2026-01-${MAX_TRACKED_LOGINS + 5}`);
  });

  QUnit.test('recordLogin keeps separate histories per profile', (assert) => {
    recordLogin('profile_a', new Date('2026-01-01T00:00:00Z'));
    recordLogin('profile_b', new Date('2026-02-01T00:00:00Z'));
    assert.deepEqual(getLoginDates('profile_a'), ['2026-01-01']);
    assert.deepEqual(getLoginDates('profile_b'), ['2026-02-01']);
  });
});
