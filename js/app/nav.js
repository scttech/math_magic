// Every page's nav includes this, so importing init.js here guarantees the
// content registry and active profile are bootstrapped even on pages that
// forget to import it directly.
import '../app/init.js';
import { getActiveProfile } from '../core/profileStore.js';
import { avatarIconUrl } from './avatars.js';
import { mountCalculator } from './calculator.js';

const LINKS = [
  { href: 'index.html', label: 'Home' },
  { href: 'quiz.html', label: 'Quiz' },
  { href: 'worksheet.html', label: 'Worksheets' },
  { href: 'skills.html', label: 'Skills' },
  { href: 'dashboard.html', label: 'Progress' },
  { href: 'profiles.html', label: 'Profiles' },
  { href: 'settings.html', label: 'Settings' },
];

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function navLinksHtml(activeHref) {
  return LINKS.map((link) => {
    const isActive = link.href === activeHref;
    return `<li><a href="${link.href}"${isActive ? ' class="active" aria-current="page"' : ''}>${link.label}</a></li>`;
  }).join('');
}

function profileHtml(profile) {
  if (!profile) return '';
  const avatar = profile.avatarIcon ? `<img class="avatar-thumb" src="${avatarIconUrl(profile.avatarIcon)}" alt="" />` : '\u{1F464} ';
  return `<a href="profiles.html" class="nav-profile">${avatar}${escapeHtml(profile.name)}</a>`;
}

export function renderNav(activeHref) {
  mountCalculator();

  const mount = document.getElementById('site-nav');
  if (!mount) return;
  mount.setAttribute('aria-label', 'Main navigation');
  mount.innerHTML = `<a href="index.html" class="nav-brand"><img class="nav-brand-icon" src="assets/images/favicon-32.png" alt="" width="28" height="28" />Math Magic</a>
    <ul class="nav-links">${navLinksHtml(activeHref)}</ul>
    ${profileHtml(getActiveProfile())}`;
}
