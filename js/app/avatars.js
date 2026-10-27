// Manifest of selectable profile avatar icons (see assets/images/avatars/).
// Filenames only — profileStore stores just the filename, and views resolve
// it to a path via avatarIconUrl() so the storage format doesn't bake in a path.
export const AVATAR_ICONS = Array.from({ length: 41 }, (_, i) => `avatar-${String(i + 1).padStart(2, '0')}.jpg`);

// index.html is the only page at the site root; everything else lives one
// level down in pages/, so the path to assets/ depends on where this runs.
const AVATAR_BASE_PATH = /\/pages\//.test(location.pathname) ? '../assets/images/avatars/' : 'assets/images/avatars/';

export function avatarIconUrl(filename) {
  return AVATAR_BASE_PATH + filename;
}
