// Versioned migration chain for a profile's progress document
// ({ schemaVersion, attempts, worksheets }), used both when reading from
// localStorage (in case the site was updated since it was written) and when
// merging an imported export file.
//
// To add a new shape: write migrations[N] = (doc) => transformed doc (N -> N+1),
// then bump CURRENT_SCHEMA_VERSION. migrate() walks the chain from whatever
// version a document declares up to CURRENT_SCHEMA_VERSION.
export const CURRENT_SCHEMA_VERSION = 1;

const migrations = {};

export function migrate(doc) {
  const base = doc && typeof doc === 'object' ? doc : {};
  let version = typeof base.schemaVersion === 'number' ? base.schemaVersion : 1;
  let result = base;

  while (version < CURRENT_SCHEMA_VERSION) {
    const step = migrations[version];
    if (!step) break;
    result = step(result);
    version += 1;
  }

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    attempts: Array.isArray(result.attempts) ? result.attempts : [],
    worksheets: Array.isArray(result.worksheets) ? result.worksheets : [],
  };
}
