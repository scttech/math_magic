import { migrate, CURRENT_SCHEMA_VERSION } from '../../js/core/schemaMigrations.js';

QUnit.module('core/schemaMigrations', () => {
  QUnit.test('migrate(undefined) returns a well-formed empty document', (assert) => {
    assert.deepEqual(migrate(undefined), {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      attempts: [],
      worksheets: [],
      lessons: {},
      resolvedMistakes: {},
      loginDates: [],
    });
  });

  QUnit.test('migrate(null) returns a well-formed empty document', (assert) => {
    assert.deepEqual(migrate(null), {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      attempts: [],
      worksheets: [],
      lessons: {},
      resolvedMistakes: {},
      loginDates: [],
    });
  });

  QUnit.test('migrate leaves an already-current document unchanged', (assert) => {
    const doc = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      attempts: [{ attemptId: 'a1' }],
      worksheets: [{ worksheetId: 'w1' }],
      lessons: { 'grade6-addSubtractFractions': { checkpointsCorrect: [2, 5] } },
      resolvedMistakes: { 'skills.additionFacts::::123': true },
      loginDates: ['2026-01-01', '2026-01-02'],
    };
    assert.deepEqual(migrate(doc), doc);
  });

  QUnit.test('migrate normalizes non-array attempts/worksheets to empty arrays', (assert) => {
    const result = migrate({ schemaVersion: CURRENT_SCHEMA_VERSION, attempts: 'nope', worksheets: null });
    assert.deepEqual(result.attempts, []);
    assert.deepEqual(result.worksheets, []);
  });

  QUnit.test('migrate normalizes a missing or malformed lessons field to an empty object', (assert) => {
    assert.deepEqual(migrate({ schemaVersion: CURRENT_SCHEMA_VERSION }).lessons, {});
    assert.deepEqual(migrate({ schemaVersion: CURRENT_SCHEMA_VERSION, lessons: 'nope' }).lessons, {});
    assert.deepEqual(migrate({ schemaVersion: CURRENT_SCHEMA_VERSION, lessons: [1, 2] }).lessons, {});
  });

  QUnit.test('migrate normalizes a missing or malformed resolvedMistakes field to an empty object', (assert) => {
    assert.deepEqual(migrate({ schemaVersion: CURRENT_SCHEMA_VERSION }).resolvedMistakes, {});
    assert.deepEqual(migrate({ schemaVersion: CURRENT_SCHEMA_VERSION, resolvedMistakes: 'nope' }).resolvedMistakes, {});
    assert.deepEqual(migrate({ schemaVersion: CURRENT_SCHEMA_VERSION, resolvedMistakes: [1, 2] }).resolvedMistakes, {});
  });

  QUnit.test('migrate normalizes a missing or malformed loginDates field to an empty array', (assert) => {
    assert.deepEqual(migrate({ schemaVersion: CURRENT_SCHEMA_VERSION }).loginDates, []);
    assert.deepEqual(migrate({ schemaVersion: CURRENT_SCHEMA_VERSION, loginDates: 'nope' }).loginDates, []);
    assert.deepEqual(migrate({ schemaVersion: CURRENT_SCHEMA_VERSION, loginDates: { a: 1 } }).loginDates, []);
  });

  QUnit.test('migrate defaults a document with no schemaVersion to the current version', (assert) => {
    const result = migrate({ attempts: [], worksheets: [] });
    assert.equal(result.schemaVersion, CURRENT_SCHEMA_VERSION);
  });

  QUnit.test('migrate upgrades a v1 document (no lessons field) to the current version, defaulting lessons to {}', (assert) => {
    const v1Doc = { schemaVersion: 1, attempts: [{ attemptId: 'a1' }], worksheets: [] };
    const result = migrate(v1Doc);
    assert.equal(result.schemaVersion, CURRENT_SCHEMA_VERSION);
    assert.deepEqual(result.attempts, v1Doc.attempts);
    assert.deepEqual(result.lessons, {});
    assert.deepEqual(result.resolvedMistakes, {});
    assert.deepEqual(result.loginDates, []);
  });
});
