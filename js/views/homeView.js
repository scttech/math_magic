import '../app/init.js';
import { renderNav } from '../app/nav.js';
import { getActiveProfile } from '../core/profileStore.js';
import { getProgress } from '../core/progressStore.js';
import { computeStreak, computeBadges } from '../core/scoring.js';

function renderProgressBanner() {
  const banner = document.getElementById('progress-banner');
  if (!banner) return;

  const profile = getActiveProfile();
  if (!profile) return;

  const progress = getProgress(profile.id);
  if (progress.attempts.length === 0) return;

  const streak = computeStreak(progress);
  const earnedBadges = computeBadges(progress).filter((b) => b.earned);

  const streakEl = document.createElement('p');
  streakEl.className = 'streak-display';
  streakEl.textContent = streak > 0 ? `\u{1F525} ${streak}-day streak! Keep it up, ${profile.name}!` : `Welcome back, ${profile.name}!`;
  banner.appendChild(streakEl);

  if (earnedBadges.length > 0) {
    const row = document.createElement('div');
    row.className = 'badges-row';
    for (const badge of earnedBadges) {
      const chip = document.createElement('span');
      chip.className = 'badge-chip';
      chip.textContent = `\u{1F3C6} ${badge.label}`;
      row.appendChild(chip);
    }
    banner.appendChild(row);
  }

  banner.hidden = false;
}

export function init() {
  renderNav('index.html');
  renderProgressBanner();
}
