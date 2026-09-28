// Manifest of selectable profile avatar icons (see assets/images/avatars/).
// Filenames only — profileStore stores just the filename, and views resolve
// it to a path via avatarIconUrl() so the storage format doesn't bake in a path.
export const AVATAR_ICONS = Array.from({ length: 41 }, (_, i) => `avatar-${String(i + 1).padStart(2, '0')}.jpg`);

const AVATAR_BASE_PATH = 'assets/images/avatars/';

export function avatarIconUrl(filename) {
  return AVATAR_BASE_PATH + filename;
}
