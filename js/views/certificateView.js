// Printable "wizard certificate": pick a profile and one of their earned
// achievements, get a one-page certificate decorated with the same
// celebration artwork shown on results screens sitewide.
import '../app/init.js';
import { renderNav } from '../app/nav.js';
import { listProfiles, getActiveProfileId } from '../core/profileStore.js';
import { getProgress } from '../core/progressStore.js';
import { listCertificateAchievements } from '../app/certificateAchievements.js';
import { pickGoodCelebration } from '../app/celebrations.js';
import { avatarIconUrl } from '../app/avatars.js';
import { escapeHtml } from '../app/glossary.js';

const els = {};

function cacheElements() {
  els.profileSelect = document.getElementById('certificate-profile-select');
  els.noAchievements = document.getElementById('certificate-no-achievements');
  els.achievementRow = document.getElementById('certificate-achievement-row');
  els.achievementSelect = document.getElementById('certificate-achievement-select');
  els.printBtn = document.getElementById('certificate-print-btn');
  els.shuffleBtn = document.getElementById('certificate-shuffle-btn');

  els.sheet = document.getElementById('certificate-sheet');
  els.image = document.getElementById('certificate-image');
  els.name = document.getElementById('certificate-name');
  els.achievementText = document.getElementById('certificate-achievement');
  els.date = document.getElementById('certificate-date');
}

function populateProfileSelect() {
  const profiles = listProfiles();
  els.profileSelect.innerHTML = profiles.map((p) => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
  const activeId = getActiveProfileId();
  if (profiles.some((p) => p.id === activeId)) els.profileSelect.value = activeId;
}

// Rebuilds the achievement <select>'s own options — only called when the
// chosen profile changes, never from renderCertificate(), since that runs on
// every achievement-select change too and would otherwise reset the very
// selection the user just made.
function populateAchievementsForProfile() {
  const profile = listProfiles().find((p) => p.id === els.profileSelect.value);
  const achievements = profile ? listCertificateAchievements(getProgress(profile.id)) : [];

  els.noAchievements.hidden = achievements.length > 0;
  els.achievementRow.hidden = achievements.length === 0;
  els.sheet.hidden = achievements.length === 0;

  els.achievementSelect.innerHTML = achievements.map((a) => `<option value="${a.id}">${escapeHtml(a.label)}</option>`).join('');
}

function renderCertificate(newArtwork) {
  if (els.sheet.hidden) return;

  const profile = listProfiles().find((p) => p.id === els.profileSelect.value);
  const achievements = listCertificateAchievements(getProgress(profile.id));
  const achievement = achievements.find((a) => a.id === els.achievementSelect.value) || achievements[0];

  const avatarImg = profile.avatarIcon ? `<img class="avatar-thumb" src="${avatarIconUrl(profile.avatarIcon)}" alt="" /> ` : '';
  els.name.innerHTML = `${avatarImg}${escapeHtml(profile.name)}`;
  els.achievementText.textContent = achievement.label;
  els.date.textContent = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  if (newArtwork || !els.image.src) els.image.src = pickGoodCelebration();
}

function handleProfileChange() {
  populateAchievementsForProfile();
  renderCertificate(true);
}

export function init() {
  cacheElements();
  renderNav('dashboard.html');

  populateProfileSelect();
  handleProfileChange();

  els.profileSelect.addEventListener('change', handleProfileChange);
  els.achievementSelect.addEventListener('change', () => renderCertificate(false));
  els.shuffleBtn.addEventListener('click', () => renderCertificate(true));
  els.printBtn.addEventListener('click', () => window.print());
}
