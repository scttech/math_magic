import { findWorksheetBySeed } from '../../js/core/worksheetLookup.js';
import { createProfile } from '../../js/core/profileStore.js';
import { recordWorksheetGenerated } from '../../js/core/progressStore.js';

QUnit.module('core/worksheetLookup', (hooks) => {
  hooks.beforeEach(() => localStorage.clear());

  QUnit.test('finds a worksheet by seed, regardless of which profile generated it', (assert) => {
    const profile = createProfile('Ari');
    recordWorksheetGenerated(profile.id, { grade: '6', topics: ['fractionsDecimals'], difficulty: 'medium', problemCount: 10, seed: 12345 });

    const found = findWorksheetBySeed(12345);
    assert.ok(found, 'a matching worksheet is found');
    assert.equal(found.grade, '6');
    assert.deepEqual(found.topics, ['fractionsDecimals']);
    assert.equal(found.difficulty, 'medium');
    assert.equal(found.problemCount, 10);
    assert.equal(found.profileId, profile.id);
    assert.equal(found.profileName, 'Ari');
  });

  QUnit.test('searches across every profile, not just the first one', (assert) => {
    const a = createProfile('Ari');
    const b = createProfile('Sam');
    recordWorksheetGenerated(a.id, { grade: '6', topics: ['negativeNumbers'], difficulty: 'easy', problemCount: 5, seed: 111 });
    recordWorksheetGenerated(b.id, { grade: '5', topics: ['fractionsOperations'], difficulty: 'hard', problemCount: 20, seed: 222 });

    const found = findWorksheetBySeed(222);
    assert.ok(found);
    assert.equal(found.profileId, b.id);
    assert.equal(found.grade, '5');
  });

  QUnit.test('returns null when no worksheet matches the seed', (assert) => {
    const profile = createProfile('Ari');
    recordWorksheetGenerated(profile.id, { grade: '6', topics: ['fractionsDecimals'], difficulty: 'medium', problemCount: 10, seed: 12345 });

    assert.equal(findWorksheetBySeed(99999), null);
  });

  QUnit.test('returns null when there are no profiles at all', (assert) => {
    assert.equal(findWorksheetBySeed(12345), null);
  });
});
