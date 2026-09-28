// Local student profiles (siblings sharing a browser). Profile metadata lives
// under one localStorage key; each profile's quiz/worksheet history lives
// under its own key (see progressStore.js), so deleting a profile is a
// simple two-key cleanup and export/import can address one profile at a time.
import { generateId } from './id.js';
import { resetProgress } from './progressStore.js';

const PROFILES_KEY = 'mathmagic.profiles';
const ACTIVE_PROFILE_KEY = 'mathmagic.activeProfileId';
const AVATAR_COLORS = ['#4a6fd9', '#2f9e5f', '#d9463e', '#c98a1f', '#8a4fd9', '#1f9ec9'];

function readProfiles() {
  try {
    const raw = JSON.parse(localStorage.getItem(PROFILES_KEY));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function writeProfiles(profiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function listProfiles() {
  return readProfiles();
}

export function getProfile(id) {
  return readProfiles().find((p) => p.id === id) || null;
}

export function createProfileWithId({ id, name, avatarColor, avatarIcon, createdAt }) {
  const profiles = readProfiles();
  if (profiles.some((p) => p.id === id)) {
    throw new Error(`Profile "${id}" already exists`);
  }
  const profile = {
    id,
    name,
    avatarColor: avatarColor || AVATAR_COLORS[profiles.length % AVATAR_COLORS.length],
    avatarIcon: avatarIcon || null,
    createdAt: createdAt || new Date().toISOString(),
  };
  profiles.push(profile);
  writeProfiles(profiles);
  if (profiles.length === 1) setActiveProfileId(profile.id);
  return profile;
}

export function createProfile(name, avatarIcon) {
  return createProfileWithId({ id: generateId('profile'), name, avatarIcon });
}

export function renameProfile(id, name) {
  const profiles = readProfiles();
  const profile = profiles.find((p) => p.id === id);
  if (!profile) return null;
  profile.name = name;
  writeProfiles(profiles);
  return profile;
}

export function setProfileAvatar(id, avatarIcon) {
  const profiles = readProfiles();
  const profile = profiles.find((p) => p.id === id);
  if (!profile) return null;
  profile.avatarIcon = avatarIcon;
  writeProfiles(profiles);
  return profile;
}

export function deleteProfile(id) {
  const profiles = readProfiles().filter((p) => p.id !== id);
  writeProfiles(profiles);
  resetProgress(id);
  if (getActiveProfileId() === id) {
    setActiveProfileId(profiles[0]?.id || null);
  }
}

export function getActiveProfileId() {
  return localStorage.getItem(ACTIVE_PROFILE_KEY);
}

export function setActiveProfileId(id) {
  if (id) {
    localStorage.setItem(ACTIVE_PROFILE_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
  }
}

export function getActiveProfile() {
  const id = getActiveProfileId();
  return id ? getProfile(id) : null;
}
