// Printable weekly progress report, covering every profile in this browser
// on one sheet — meant to be printed/saved as a PDF and sent home. Reuses
// the existing scoring.js aggregations (computeSummary, computeAccuracyByTopic,
// computeStreak, computeBadges) scoped to the last 7 days via
// filterAttemptsSince — no new aggregation logic, just a windowed input.
import '../app/init.js';
import { renderNav } from '../app/nav.js';
import { listProfiles } from '../core/profileStore.js';
import { getProgress } from '../core/progressStore.js';
import { computeSummary, computeAccuracyByTopic, computeStreak, computeBadges, filterAttemptsSince } from '../core/scoring.js';
import { topicLabel } from '../app/topicLabels.js';
import { avatarIconUrl } from '../app/avatars.js';
import { escapeHtml } from '../app/glossary.js';

const DAYS_IN_WINDOW = 7;
const WEAKEST_TOPICS_SHOWN = 2;

const els = {};

function cacheElements() {
  els.emptyState = document.getElementById('report-empty');
  els.sheet = document.getElementById('report-sheet');
  els.dateRange = document.getElementById('report-date-range');
  els.profilesContainer = document.getElementById('report-profiles');
  els.printBtn = document.getElementById('print-report-btn');
}

function formatDate(date) {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Badges earned as of `progress` but not yet earned as of `beforeProgress` (same attempts, minus the window). */
function newlyEarnedBadges(progress, beforeProgress) {
  const now = computeBadges(progress);
  const before = computeBadges(beforeProgress);
  return now.filter((b) => b.earned && !before.find((x) => x.id === b.id)?.earned);
}

function renderProfileSection(profile, fullProgress, sinceDate) {
  const windowed = filterAttemptsSince(fullProgress, sinceDate);
  if (windowed.attempts.length === 0) return null;

  const beforeWindow = { ...fullProgress, attempts: fullProgress.attempts.filter((a) => a.completedAt && new Date(a.completedAt) < sinceDate) };
  const summary = computeSummary(windowed);
  const weakest = computeAccuracyByTopic(windowed).slice(0, WEAKEST_TOPICS_SHOWN);
  // Streak is a "consecutive days through today" concept, so it must read the
  // full history, not the windowed slice — otherwise a streak longer than the
  // report window would be understated.
  const streak = computeStreak(fullProgress);
  const newBadges = newlyEarnedBadges(fullProgress, beforeWindow);

  const avatarImg = profile.avatarIcon ? `<img class="avatar-thumb" src="${avatarIconUrl(profile.avatarIcon)}" alt="" />` : '';
  const weakestLine = weakest.length
    ? `<p>Weakest this week: ${weakest.map((t) => `${escapeHtml(topicLabel(t.topic))} (${Math.round(t.accuracy * 100)}%)`).join(', ')}</p>`
    : '';
  const badgesLine = newBadges.length ? `<p>New this week: ${newBadges.map((b) => `🏆 ${escapeHtml(b.label)}`).join(', ')}</p>` : '';
  const streakLine = streak > 0 ? ` · 🔥 ${streak}-day streak` : '';

  const section = document.createElement('section');
  section.className = 'report-profile';
  section.innerHTML = `
    <h3>${avatarImg}${escapeHtml(profile.name)}</h3>
    <p>${summary.totalProblems} problem${summary.totalProblems === 1 ? '' : 's'} answered · ${Math.round(summary.overallAccuracy * 100)}% accuracy${streakLine}</p>
    ${weakestLine}
    ${badgesLine}`;
  return section;
}

export function init() {
  cacheElements();
  renderNav('dashboard.html');

  const now = new Date();
  const sinceDate = new Date(now.getTime() - DAYS_IN_WINDOW * 24 * 60 * 60 * 1000);
  els.dateRange.textContent = `${formatDate(sinceDate)} – ${formatDate(now)}`;

  els.profilesContainer.innerHTML = '';
  let anyActivity = false;
  for (const profile of listProfiles()) {
    const section = renderProfileSection(profile, getProgress(profile.id), sinceDate);
    if (section) {
      els.profilesContainer.appendChild(section);
      anyActivity = true;
    }
  }

  els.emptyState.hidden = anyActivity;
  els.sheet.hidden = !anyActivity;

  els.printBtn.addEventListener('click', () => window.print());
}
