import '../app/init.js';
import { renderNav } from '../app/nav.js';
import { getActiveProfile } from '../core/profileStore.js';
import { getProgress } from '../core/progressStore.js';
import { computeStreak, computeBadges } from '../core/scoring.js';
import { getRecommendedPractice } from '../app/recommendation.js';
import { getContinueLearning } from '../app/continueLearning.js';

function renderProgressBanner() {
  const banner = document.getElementById('progress-banner');
  if (!banner) return;

  const profile = getActiveProfile();
  if (!profile) return;

  const progress = getProgress(profile.id);
  if (progress.attempts.length === 0) return;

  const streak = computeStreak(progress);
  const earnedBadges = computeBadges(progress).filter((b) => b.earned);
  if (streak === 0 && earnedBadges.length === 0) return;

  if (streak > 0) {
    const streakEl = document.createElement('p');
    streakEl.className = 'streak-display';
    streakEl.textContent = `\u{1F525} ${streak}-day streak! Keep it up, ${profile.name}!`;
    banner.appendChild(streakEl);
  }

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

function renderRecommendedPractice() {
  const card = document.getElementById('recommended-practice');
  if (!card) return;

  const profile = getActiveProfile();
  if (!profile) return;

  const recommendation = getRecommendedPractice(getProgress(profile.id));
  if (!recommendation) return;

  const percent = Math.round(recommendation.accuracy * 100);
  document.getElementById('recommended-practice-text').textContent =
    `You've gotten ${percent}% correct on ${recommendation.label} lately — a little more practice here could help.`;
  document.getElementById('recommended-practice-link').href = recommendation.url;
  card.hidden = false;
}

function renderLearnCard() {
  const textEl = document.getElementById('learn-card-text');
  const linkEl = document.getElementById('learn-card-link');
  if (!textEl || !linkEl) return;

  const profile = getActiveProfile();
  const continueLearning = profile ? getContinueLearning(profile.id) : null;
  if (!continueLearning) return;

  const verb = continueLearning.status === 'in-progress' ? 'Pick up where you left off' : 'Start your next lesson';
  textEl.textContent = `${verb}: "${continueLearning.lesson.title}."`;
  linkEl.textContent = continueLearning.status === 'in-progress' ? 'Continue Lesson' : 'Start Lesson';
  linkEl.href = continueLearning.url;
}

export function init() {
  renderNav('index.html');
  renderProgressBanner();
  renderRecommendedPractice();
  renderLearnCard();
}
