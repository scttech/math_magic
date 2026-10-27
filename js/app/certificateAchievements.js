// Which achievements a profile can print a wizard certificate for. Reuses
// the dashboard's own computeBadges()/computeSummary() — no separate
// "achievement" concept to keep in sync with badges.
import { computeBadges, computeSummary } from '../core/scoring.js';

/**
 * Every earned badge, plus a baseline "Dedicated Practice" achievement once
 * any problem has been answered — so a student doesn't need to have hit a
 * specific badge milestone yet to get a certificate for showing up and trying.
 */
export function listCertificateAchievements(progressData) {
  const achievements = computeBadges(progressData)
    .filter((badge) => badge.earned)
    .map((badge) => ({ id: badge.id, label: badge.label }));

  if (computeSummary(progressData).totalProblems > 0) {
    achievements.push({ id: 'dedicated-practice', label: 'Dedicated Practice' });
  }

  return achievements;
}
