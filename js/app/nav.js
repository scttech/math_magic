// Every page's nav includes this, so importing init.js here guarantees the
// content registry and active profile are bootstrapped even on pages that
// forget to import it directly.
import '../app/init.js';
import { getActiveProfile } from '../core/profileStore.js';
import { avatarIconUrl } from './avatars.js';

const LINKS = [
  { href: 'index.html', label: 'Home' },
  { href: 'quiz.html', label: 'Quiz' },
  { href: 'worksheet.html', label: 'Worksheets' },
  { href: 'skills.html', label: 'Skills' },
  { href: 'dashboard.html', label: 'Progress' },
  { href: 'profiles.html', label: 'Profiles' },
  { href: 'settings.html', label: 'Settings' },
];

export function renderNav(activeHref) {
  const mount = document.getElementById('site-nav');
  if (!mount) return;
  mount.innerHTML = '';
  mount.setAttribute('aria-label', 'Main navigation');

  const brand = document.createElement('a');
  brand.href = 'index.html';
  brand.className = 'nav-brand';
  const brandIcon = document.createElement('img');
  brandIcon.className = 'nav-brand-icon';
  brandIcon.src = 'assets/images/favicon-32.png';
  brandIcon.alt = '';
  brandIcon.width = 28;
  brandIcon.height = 28;
  brand.appendChild(brandIcon);
  brand.appendChild(document.createTextNode('Math Magic'));
  mount.appendChild(brand);

  const list = document.createElement('ul');
  list.className = 'nav-links';
  for (const link of LINKS) {
    const item = document.createElement('li');
    const anchor = document.createElement('a');
    anchor.href = link.href;
    anchor.textContent = link.label;
    if (link.href === activeHref) {
      anchor.setAttribute('aria-current', 'page');
      anchor.classList.add('active');
    }
    item.appendChild(anchor);
    list.appendChild(item);
  }
  mount.appendChild(list);

  const profile = getActiveProfile();
  if (profile) {
    const profileLink = document.createElement('a');
    profileLink.href = 'profiles.html';
    profileLink.className = 'nav-profile';

    if (profile.avatarIcon) {
      const img = document.createElement('img');
      img.className = 'avatar-thumb';
      img.src = avatarIconUrl(profile.avatarIcon);
      img.alt = '';
      profileLink.appendChild(img);
    } else {
      profileLink.appendChild(document.createTextNode('\u{1F464} '));
    }
    profileLink.appendChild(document.createTextNode(profile.name));
    mount.appendChild(profileLink);
  }
}
