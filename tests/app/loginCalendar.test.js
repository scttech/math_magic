import { buildMonthGrid, WEEKDAY_LABELS } from '../../js/app/loginCalendar.js';

QUnit.module('app/loginCalendar', () => {
  QUnit.test('WEEKDAY_LABELS has exactly 7 entries starting with Sunday', (assert) => {
    assert.equal(WEEKDAY_LABELS.length, 7);
    assert.equal(WEEKDAY_LABELS[0], 'Sun');
  });

  QUnit.test('buildMonthGrid returns full weeks (7 cells each) covering the whole month', (assert) => {
    // January 2026 has 31 days.
    const weeks = buildMonthGrid(2026, 0, []);
    for (const week of weeks) assert.equal(week.length, 7);
    const realDays = weeks.flat().filter(Boolean);
    assert.equal(realDays.length, 31);
    assert.deepEqual(
      realDays.map((c) => c.day),
      Array.from({ length: 31 }, (_, i) => i + 1)
    );
  });

  QUnit.test('buildMonthGrid pads with null before the 1st and after the last day', (assert) => {
    // January 1, 2026 is a Thursday (weekday index 4), so 4 leading nulls.
    const weeks = buildMonthGrid(2026, 0, []);
    assert.deepEqual(weeks[0].slice(0, 4), [null, null, null, null]);
    assert.equal(weeks[0][4].day, 1);
  });

  QUnit.test('buildMonthGrid marks logged days and leaves others unmarked', (assert) => {
    const weeks = buildMonthGrid(2026, 0, ['2026-01-05', '2026-01-20']);
    const byDay = new Map(weeks.flat().filter(Boolean).map((c) => [c.day, c]));
    assert.ok(byDay.get(5).logged);
    assert.ok(byDay.get(20).logged);
    assert.notOk(byDay.get(6).logged);
  });

  QUnit.test('buildMonthGrid ignores logged dates outside the requested month', (assert) => {
    const weeks = buildMonthGrid(2026, 0, ['2026-02-05', '2025-01-05']);
    const anyLogged = weeks.flat().some((c) => c && c.logged);
    assert.notOk(anyLogged);
  });

  QUnit.test('buildMonthGrid flags exactly the matching cell as today', (assert) => {
    const weeks = buildMonthGrid(2026, 0, [], '2026-01-15');
    const byDay = new Map(weeks.flat().filter(Boolean).map((c) => [c.day, c]));
    assert.ok(byDay.get(15).isToday);
    assert.notOk(byDay.get(14).isToday);
  });

  QUnit.test('buildMonthGrid handles February in a leap year', (assert) => {
    const weeks = buildMonthGrid(2028, 1, []); // 2028 is a leap year
    const realDays = weeks.flat().filter(Boolean);
    assert.equal(realDays.length, 29);
  });
});
