// Per-profile quiz/worksheet history, stored in localStorage under its own
// key per profile. Reads always run the document through migrate() so a
// schema bump is applied transparently, even to data written by an older
// version of the site.
import { migrate, CURRENT_SCHEMA_VERSION } from './schemaMigrations.js';
import { generateId } from './id.js';

function progressKey(profileId) {
  return `mathmagic.progress.${profileId}`;
}

function emptyDoc() {
  return { schemaVersion: CURRENT_SCHEMA_VERSION, attempts: [], worksheets: [] };
}

export function getProgress(profileId) {
  try {
    const raw = localStorage.getItem(progressKey(profileId));
    if (!raw) return emptyDoc();
    return migrate(JSON.parse(raw));
  } catch {
    return emptyDoc();
  }
}

export function setProgress(profileId, doc) {
  const migrated = migrate(doc);
  localStorage.setItem(progressKey(profileId), JSON.stringify(migrated));
  return migrated;
}

export function recordQuizAttempt(profileId, { type = 'quiz', grade, topics, difficulty, startedAt, completedAt, problems }) {
  const doc = getProgress(profileId);
  const attempt = { attemptId: generateId('atmp'), type, grade, topics, difficulty, startedAt, completedAt, problems };
  doc.attempts.push(attempt);
  setProgress(profileId, doc);
  return attempt;
}

export function recordWorksheetGenerated(profileId, { grade, topics, difficulty, problemCount, seed, createdAt }) {
  const doc = getProgress(profileId);
  const worksheet = {
    worksheetId: generateId('wksh'),
    createdAt: createdAt || new Date().toISOString(),
    grade,
    topics,
    difficulty,
    problemCount,
    seed,
  };
  doc.worksheets.push(worksheet);
  setProgress(profileId, doc);
  return worksheet;
}

export function resetProgress(profileId) {
  localStorage.removeItem(progressKey(profileId));
}
