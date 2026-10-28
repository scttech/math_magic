import '../app/init.js';
import { renderNav } from '../app/nav.js';
import { topicLabel } from '../app/topicLabels.js';
import { getActiveProfile } from '../core/profileStore.js';
import { getProgress } from '../core/progressStore.js';
import { getLoginDates } from '../core/loginHistory.js';
import { buildMonthGrid, WEEKDAY_LABELS } from '../app/loginCalendar.js';
import { computeAccuracyByTopic, computeAccuracyTrend, computeSummary, computeDuelStats } from '../core/scoring.js';
import { renderAccuracyByTopicChart } from '../charts/accuracyByTopicChart.js';
import { renderTrendChart } from '../charts/trendOverTimeChart.js';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const els = {};
let currentProgress = null;
let currentByTopic = [];

function cacheElements() {
  els.emptyState = document.getElementById('dashboard-empty');
  els.content = document.getElementById('dashboard-content');
  els.profileName = document.getElementById('dashboard-profile-name');
  els.statGrid = document.getElementById('stat-grid');
  els.topicChart = document.getElementById('accuracy-by-topic-chart');
  els.trendChart = document.getElementById('trend-chart');
  els.trendTopicSelect = document.getElementById('trend-topic-select');
  els.loginCalendarMonth = document.getElementById('login-calendar-month');
  els.loginCalendar = document.getElementById('login-calendar');
}

function renderLoginCalendar(profileId) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const todayStr = now.toISOString().slice(0, 10);
  const loginDates = profileId ? getLoginDates(profileId) : [];
  const weeks = buildMonthGrid(year, month, loginDates, todayStr);

  els.loginCalendarMonth.textContent = `${MONTH_NAMES[month]} ${year}`;

  const weekdayHeader = WEEKDAY_LABELS.map((label) => `<div class="login-calendar-weekday">${label}</div>`).join('');
  const dayCells = weeks
    .flat()
    .map((cell) => {
      if (!cell) return '<div class="login-calendar-day empty"></div>';
      const classes = ['login-calendar-day'];
      if (cell.logged) classes.push('logged');
      if (cell.isToday) classes.push('today');
      return `<div class="${classes.join(' ')}">${cell.day}</div>`;
    })
    .join('');

  els.loginCalendar.innerHTML = weekdayHeader + dayCells;
}

function renderStatTiles(progress) {
  const summary = computeSummary(progress);
  const duelStats = computeDuelStats(progress);
  const tiles = [
    { value: summary.totalAttempts, label: 'Quizzes Taken' },
    { value: summary.totalProblems, label: 'Problems Answered' },
    { value: `${Math.round(summary.overallAccuracy * 100)}%`, label: 'Overall Accuracy' },
    { value: summary.totalWorksheets, label: 'Worksheets Made' },
  ];
  if (duelStats.total > 0) tiles.push({ value: `${duelStats.wins}W – ${duelStats.losses}L`, label: 'Duel Record' });
  els.statGrid.innerHTML = tiles
    .map((t) => `<div class="stat-tile"><span class="stat-value">${t.value}</span><span class="stat-label">${t.label}</span></div>`)
    .join('');
}

function populateTrendTopicFilter() {
  const options = ['<option value="">All Topics</option>', ...currentByTopic.map((d) => `<option value="${d.topic}">${topicLabel(d.topic)}</option>`)];
  els.trendTopicSelect.innerHTML = options.join('');
}

function renderTrendForCurrentFilter() {
  const topic = els.trendTopicSelect.value || null;
  const trend = computeAccuracyTrend(currentProgress, { topic });
  renderTrendChart(els.trendChart, trend);
}

export function init() {
  cacheElements();
  renderNav('dashboard.html');

  const profile = getActiveProfile();
  els.profileName.textContent = profile ? `— ${profile.name}` : '';
  currentProgress = profile ? getProgress(profile.id) : { attempts: [], worksheets: [] };

  // Shown regardless of whether any quiz/skill attempts exist yet — logging
  // in is tracked independently of completing anything.
  renderLoginCalendar(profile ? profile.id : null);

  if (currentProgress.attempts.length === 0) {
    els.emptyState.hidden = false;
    els.content.hidden = true;
    return;
  }

  els.emptyState.hidden = true;
  els.content.hidden = false;

  currentByTopic = computeAccuracyByTopic(currentProgress);
  renderStatTiles(currentProgress);
  renderAccuracyByTopicChart(els.topicChart, currentByTopic);
  populateTrendTopicFilter();
  renderTrendForCurrentFilter();

  els.trendTopicSelect.addEventListener('change', renderTrendForCurrentFilter);
}
