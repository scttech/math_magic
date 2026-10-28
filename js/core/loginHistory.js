// Tracks the last 20 calendar dates a profile used the site, for the
// dashboard's login calendar. Recorded once per page load (see
// js/app/init.js's bootstrap) for whichever profile is active; idempotent
// per day — UTC day boundary, same convention computeStreak() already uses
// elsewhere in scoring.js — so revisiting later the same day never adds a
// duplicate entry.
import { getProgress, setProgress } from './progressStore.js';

export const MAX_TRACKED_LOGINS = 20;

function dateString(referenceDate) {
  return referenceDate.toISOString().slice(0, 10);
}

/** Records today as a login day for this profile, if it isn't already the most recent one on record. */
export function recordLogin(profileId, referenceDate = new Date()) {
  const today = dateString(referenceDate);
  const doc = getProgress(profileId);
  if (doc.loginDates[doc.loginDates.length - 1] === today) return doc.loginDates;

  doc.loginDates = [...doc.loginDates, today].slice(-MAX_TRACKED_LOGINS);
  setProgress(profileId, doc);
  return doc.loginDates;
}

/** The tracked login dates (YYYY-MM-DD strings, oldest first), up to MAX_TRACKED_LOGINS of them. */
export function getLoginDates(profileId) {
  return getProgress(profileId).loginDates;
}
