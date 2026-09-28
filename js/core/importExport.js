// Export all local progress to a downloadable JSON file, and import/merge a
// previously exported file back in. Merge is append-only and keyed by
// attemptId/worksheetId — importing the same file twice never duplicates or
// overwrites existing records.
import { listProfiles, getProfile, createProfileWithId } from './profileStore.js';
import { getProgress, setProgress } from './progressStore.js';
import { migrate, CURRENT_SCHEMA_VERSION } from './schemaMigrations.js';

export function buildExportDocument({ profileIds } = {}) {
  const allProfiles = listProfiles();
  const targetProfiles = profileIds ? allProfiles.filter((p) => profileIds.includes(p.id)) : allProfiles;
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    app: 'math-magic',
    profiles: targetProfiles.map((p) => {
      const progress = getProgress(p.id);
      return {
        id: p.id,
        name: p.name,
        avatarColor: p.avatarColor,
        avatarIcon: p.avatarIcon,
        createdAt: p.createdAt,
        attempts: progress.attempts,
        worksheets: progress.worksheets,
      };
    }),
  };
}

export function downloadExport({ profileIds } = {}) {
  const doc = buildExportDocument({ profileIds });
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `math-magic-progress-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return doc;
}

export function parseImportText(jsonText) {
  let raw;
  try {
    raw = JSON.parse(jsonText);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  if (!raw || !Array.isArray(raw.profiles)) {
    throw new Error('That file does not look like a Math Magic export.');
  }
  return raw;
}

export function mergeImportedDocument(doc) {
  const docVersion = typeof doc.schemaVersion === 'number' ? doc.schemaVersion : 1;
  const summary = { profilesCreated: 0, profilesUpdated: 0, attemptsAdded: 0, worksheetsAdded: 0 };

  for (const importedProfile of doc.profiles) {
    const migratedProgress = migrate({
      schemaVersion: docVersion,
      attempts: importedProfile.attempts,
      worksheets: importedProfile.worksheets,
    });

    let profile = getProfile(importedProfile.id);
    if (!profile) {
      profile = createProfileWithId({
        id: importedProfile.id,
        name: importedProfile.name,
        avatarColor: importedProfile.avatarColor,
        avatarIcon: importedProfile.avatarIcon,
        createdAt: importedProfile.createdAt,
      });
      summary.profilesCreated += 1;
    } else {
      summary.profilesUpdated += 1;
    }

    const existing = getProgress(profile.id);
    const existingAttemptIds = new Set(existing.attempts.map((a) => a.attemptId));
    const existingWorksheetIds = new Set(existing.worksheets.map((w) => w.worksheetId));

    const newAttempts = migratedProgress.attempts.filter((a) => !existingAttemptIds.has(a.attemptId));
    const newWorksheets = migratedProgress.worksheets.filter((w) => !existingWorksheetIds.has(w.worksheetId));

    if (newAttempts.length || newWorksheets.length) {
      setProgress(profile.id, {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        attempts: [...existing.attempts, ...newAttempts],
        worksheets: [...existing.worksheets, ...newWorksheets],
      });
      summary.attemptsAdded += newAttempts.length;
      summary.worksheetsAdded += newWorksheets.length;
    }
  }

  return summary;
}
