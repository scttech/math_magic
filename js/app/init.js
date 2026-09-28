// Registers all currently available content packs with the registry, and
// ensures a profile exists and is active. Every page imports this (for its
// side effects) before using the registry or the active profile.
import '../generators/grade6/index.js';
import { listProfiles, createProfile, getActiveProfile, setActiveProfileId } from '../core/profileStore.js';

function ensureActiveProfile() {
  const profiles = listProfiles();
  if (profiles.length === 0) {
    const profile = createProfile('Player 1');
    setActiveProfileId(profile.id);
    return profile;
  }
  const active = getActiveProfile();
  if (!active) {
    setActiveProfileId(profiles[0].id);
    return profiles[0];
  }
  return active;
}

ensureActiveProfile();

