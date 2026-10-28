// Pure month-grid builder for the dashboard's login calendar — no DOM, so
// it's directly unit-testable; js/views/dashboardView.js turns the result
// into markup. Mirrors the "pure logic split from rendering" pattern used
// elsewhere (mazeGenerator.js, blasterEngine.js's helpers, etc.).
export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad2(n) {
  return String(n).padStart(2, '0');
}

/**
 * @param {number} year
 * @param {number} month - 0-indexed, same convention as Date's getMonth()/getUTCMonth()
 * @param {string[]} loginDates - YYYY-MM-DD strings
 * @param {string} [todayStr] - YYYY-MM-DD, defaults to not marking any day "today"
 * @returns {Array<Array<{day:number, dateStr:string, logged:boolean, isToday:boolean}|null>>} weeks of 7 cells each, null padding outside the month
 */
export function buildMonthGrid(year, month, loginDates, todayStr = null) {
  const loggedSet = new Set(loginDates);
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const startWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${pad2(month + 1)}-${pad2(day)}`;
    cells.push({ day, dateStr, logged: loggedSet.has(dateStr), isToday: dateStr === todayStr });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
