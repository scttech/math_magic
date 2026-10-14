// Finds a previously-generated worksheet by its seed (the number printed on
// the worksheet itself, e.g. "Worksheet #408378565"), searching every local
// profile's history — the printout doesn't say which profile generated it,
// and a worksheet's seed is effectively unique regardless of who made it.
// A separate module (rather than adding this to progressStore.js) only
// because profileStore.js and progressStore.js already import each other;
// this avoids adding a third edge to that cycle.
import { listProfiles } from './profileStore.js';
import { getProgress } from './progressStore.js';

export function findWorksheetBySeed(seed) {
  for (const profile of listProfiles()) {
    const match = getProgress(profile.id).worksheets.find((w) => w.seed === seed);
    if (match) return { ...match, profileId: profile.id, profileName: profile.name };
  }
  return null;
}
