import { createProfile, getProfile, listProfiles } from '../../js/core/profileStore.js';
import { recordQuizAttempt, getProgress } from '../../js/core/progressStore.js';
import { buildExportDocument, parseImportText, mergeImportedDocument } from '../../js/core/importExport.js';
import { CURRENT_SCHEMA_VERSION } from '../../js/core/schemaMigrations.js';

function sampleAttempt(overrides = {}) {
  return {
    grade: '6',
    topics: ['fractionsDecimals'],
    difficulty: 'easy',
    startedAt: '2026-01-01T00:00:00.000Z',
    completedAt: '2026-01-01T00:05:00.000Z',
    problems: [],
    ...overrides,
  };
}

QUnit.module('core/importExport', (hooks) => {
  hooks.beforeEach(() => localStorage.clear());

  QUnit.test('buildExportDocument includes every profile with its attempts/worksheets', (assert) => {
    const profile = createProfile('Ari');
    recordQuizAttempt(profile.id, sampleAttempt());

    const doc = buildExportDocument();
    assert.equal(doc.schemaVersion, CURRENT_SCHEMA_VERSION);
    assert.equal(doc.app, 'math-magic');
    assert.equal(doc.profiles.length, 1);
    assert.equal(doc.profiles[0].id, profile.id);
    assert.equal(doc.profiles[0].attempts.length, 1);
  });

  QUnit.test('buildExportDocument and mergeImportedDocument carry avatarIcon through', (assert) => {
    const profile = createProfile('Ari', 'avatar-05.jpg');
    const doc = buildExportDocument();
    assert.equal(doc.profiles[0].avatarIcon, 'avatar-05.jpg');

    localStorage.clear();
    mergeImportedDocument(doc);
    assert.equal(getProfile(profile.id).avatarIcon, 'avatar-05.jpg');
  });

  QUnit.test('buildExportDocument can be scoped to specific profile ids', (assert) => {
    const a = createProfile('Ari');
    createProfile('Sam');
    const doc = buildExportDocument({ profileIds: [a.id] });
    assert.equal(doc.profiles.length, 1);
    assert.equal(doc.profiles[0].id, a.id);
  });

  QUnit.test('parseImportText rejects invalid JSON', (assert) => {
    assert.throws(() => parseImportText('not json{{'), /valid JSON/);
  });

  QUnit.test('parseImportText rejects JSON without a profiles array', (assert) => {
    assert.throws(() => parseImportText(JSON.stringify({ foo: 1 })), /Math Magic export/);
  });

  QUnit.test('parseImportText accepts a well-formed export document', (assert) => {
    const doc = { schemaVersion: 1, profiles: [] };
    assert.deepEqual(parseImportText(JSON.stringify(doc)), doc);
  });

  QUnit.test('mergeImportedDocument creates a new profile when the id is unknown locally', (assert) => {
    const importDoc = {
      schemaVersion: 1,
      profiles: [
        {
          id: 'profile_imported',
          name: 'Jordan',
          avatarColor: '#123456',
          createdAt: '2026-01-01T00:00:00.000Z',
          attempts: [{ attemptId: 'atmp_1', type: 'quiz', grade: '6', topics: [], startedAt: '', completedAt: '', problems: [] }],
          worksheets: [],
        },
      ],
    };

    const summary = mergeImportedDocument(importDoc);

    assert.equal(summary.profilesCreated, 1);
    assert.equal(summary.attemptsAdded, 1);
    assert.ok(getProfile('profile_imported'));
    assert.equal(getProfile('profile_imported').name, 'Jordan');
    assert.equal(getProgress('profile_imported').attempts.length, 1);
  });

  QUnit.test('mergeImportedDocument is idempotent — importing the same file twice adds nothing new', (assert) => {
    const importDoc = {
      schemaVersion: 1,
      profiles: [
        {
          id: 'profile_imported',
          name: 'Jordan',
          attempts: [{ attemptId: 'atmp_1', type: 'quiz', grade: '6', topics: [], startedAt: '', completedAt: '', problems: [] }],
          worksheets: [{ worksheetId: 'wksh_1', createdAt: '', grade: '6', topics: [], difficulty: 'easy', problemCount: 10, seed: 1 }],
        },
      ],
    };

    mergeImportedDocument(importDoc);
    const secondSummary = mergeImportedDocument(importDoc);

    assert.equal(secondSummary.profilesCreated, 0);
    assert.equal(secondSummary.profilesUpdated, 1);
    assert.equal(secondSummary.attemptsAdded, 0);
    assert.equal(secondSummary.worksheetsAdded, 0);

    const progress = getProgress('profile_imported');
    assert.equal(progress.attempts.length, 1);
    assert.equal(progress.worksheets.length, 1);
  });

  QUnit.test('mergeImportedDocument merges new attempts into an existing profile without touching existing ones', (assert) => {
    const local = createProfileWithKnownId('profile_shared', 'Local Name');
    recordQuizAttempt(local.id, sampleAttempt());
    const existingAttemptId = getProgress(local.id).attempts[0].attemptId;

    const importDoc = {
      schemaVersion: 1,
      profiles: [
        {
          id: 'profile_shared',
          name: 'Imported Name',
          attempts: [
            { attemptId: existingAttemptId, type: 'quiz', grade: '6', topics: [], startedAt: '', completedAt: '', problems: [] },
            { attemptId: 'atmp_new', type: 'quiz', grade: '6', topics: [], startedAt: '', completedAt: '', problems: [] },
          ],
          worksheets: [],
        },
      ],
    };

    const summary = mergeImportedDocument(importDoc);

    assert.equal(summary.profilesCreated, 0);
    assert.equal(summary.attemptsAdded, 1, 'only the genuinely new attempt is added');
    assert.equal(getProfile('profile_shared').name, 'Local Name', 'existing profile metadata is not overwritten');
    assert.equal(getProgress('profile_shared').attempts.length, 2);
  });

  QUnit.test('export -> import round trip on a fresh browser reproduces the same progress', (assert) => {
    const profile = createProfile('Ari');
    recordQuizAttempt(profile.id, sampleAttempt());
    const exportDoc = buildExportDocument();

    localStorage.clear();

    const summary = mergeImportedDocument(exportDoc);
    assert.equal(summary.profilesCreated, 1);
    assert.equal(getProgress(profile.id).attempts.length, 1);
    assert.equal(listProfiles().length, 1);
  });
});

function createProfileWithKnownId(id, name) {
  // Import a minimal doc with no attempts just to create the profile row with a known id,
  // exercising the same code path mergeImportedDocument itself uses.
  mergeImportedDocument({ schemaVersion: 1, profiles: [{ id, name, attempts: [], worksheets: [] }] });
  return getProfile(id);
}
