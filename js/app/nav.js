// Every page's nav includes this, so importing init.js here guarantees the
// content registry and active profile are bootstrapped even on pages that
// forget to import it directly.
import '../app/init.js';
import { getActiveProfile } from '../core/profileStore.js';
import { avatarIconUrl } from './avatars.js';
import { mountCalculator } from './calculator.js';
import { mountGlossaryPopover } from './glossaryPopover.js';

const LINKS = [
  { href: 'index.html', label: 'Home' },
  { href: 'learn.html', label: 'Learn' },
  { href: 'quiz.html', label: 'Quiz' },
  { href: 'worksheet.html', label: 'Worksheets' },
  { href: 'skills.html', label: 'Skills' },
  { href: 'dashboard.html', label: 'Progress' },
  { href: 'profiles.html', label: 'Profiles' },
  { href: 'settings.html', label: 'Settings' },
];

// index.html is the only page at the site root (required for GitHub Pages);
// every other page lives one level down in pages/. This nav is shared by
// both, so hrefs are resolved relative to wherever it's currently mounted.
const inPagesDir = /\/pages\//.test(location.pathname);

function resolveHref(href) {
  if (href === 'index.html') return inPagesDir ? '../index.html' : href;
  return inPagesDir ? href : `pages/${href}`;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function navLinksHtml(activeHref) {
  return LINKS.map((link) => {
    const isActive = link.href === activeHref;
    return `<li><a href="${resolveHref(link.href)}"${isActive ? ' class="active" aria-current="page"' : ''}>${link.label}</a></li>`;
  }).join('');
}

function profileHtml(profile) {
  if (!profile) return '';
  const avatar = profile.avatarIcon ? `<img class="avatar-thumb" src="${avatarIconUrl(profile.avatarIcon)}" alt="" />` : '\u{1F464} ';
  return `<a href="${resolveHref('profiles.html')}" class="nav-profile">${avatar}${escapeHtml(profile.name)}</a>`;
}

export function renderNav(activeHref) {
  mountCalculator();
  mountGlossaryPopover();

  const mount = document.getElementById('site-nav');
  if (!mount) return;
  mount.setAttribute('aria-label', 'Main navigation');
  const faviconSrc = inPagesDir ? '../assets/images/favicon-32.png' : 'assets/images/favicon-32.png';
  mount.innerHTML = `<a href="${resolveHref('index.html')}" class="nav-brand"><img class="nav-brand-icon" src="${faviconSrc}" alt="" width="28" height="28" />Math Magic</a>
    <ul class="nav-links">${navLinksHtml(activeHref)}</ul>
    ${profileHtml(getActiveProfile())}`;
}
