// Versioned migration chain for a profile's progress document
// ({ schemaVersion, attempts, worksheets, lessons }), used both when reading
// from localStorage (in case the site was updated since it was written) and
// when merging an imported export file.
//
// To add a new shape: write migrations[N] = (doc) => transformed doc (N -> N+1),
// then bump CURRENT_SCHEMA_VERSION. migrate() walks the chain from whatever
// version a document declares up to CURRENT_SCHEMA_VERSION.
export const CURRENT_SCHEMA_VERSION = 4;

const migrations = {
  // v1 -> v2: added `lessons` (per-lesson checkpoint-correctness tracking for
  // the Learn roadmap). Purely additive — the final shape step below already
  // defaults a missing `lessons` to {}, so this is just an explicit version bump.
  1: (doc) => doc,
  // v2 -> v3: added `resolvedMistakes` (Review Mistakes: which missed
  // problems have since been answered correctly, keyed by generatorId +
  // difficulty + seed). Purely additive, same reasoning as v1 -> v2.
  2: (doc) => doc,
  // v3 -> v4: added `loginDates` (the last 20 calendar dates this profile
  // used the site, for the dashboard's login calendar). Purely additive,
  // same reasoning as v1 -> v2.
  3: (doc) => doc,
};

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
    lessons: result.lessons && typeof result.lessons === 'object' && !Array.isArray(result.lessons) ? result.lessons : {},
    resolvedMistakes:
      result.resolvedMistakes && typeof result.resolvedMistakes === 'object' && !Array.isArray(result.resolvedMistakes) ? result.resolvedMistakes : {},
    loginDates: Array.isArray(result.loginDates) ? result.loginDates : [],
  };
}
