import { migrate, CURRENT_SCHEMA_VERSION } from '../../js/core/schemaMigrations.js';

QUnit.module('core/schemaMigrations', () => {
  QUnit.test('migrate(undefined) returns a well-formed empty document', (assert) => {
    assert.deepEqual(migrate(undefined), { schemaVersion: CURRENT_SCHEMA_VERSION, attempts: [], worksheets: [] });
  });

  QUnit.test('migrate(null) returns a well-formed empty document', (assert) => {
    assert.deepEqual(migrate(null), { schemaVersion: CURRENT_SCHEMA_VERSION, attempts: [], worksheets: [] });
  });

  QUnit.test('migrate leaves an already-current document unchanged', (assert) => {
    const doc = { schemaVersion: 1, attempts: [{ attemptId: 'a1' }], worksheets: [{ worksheetId: 'w1' }] };
    assert.deepEqual(migrate(doc), doc);
  });

  QUnit.test('migrate normalizes non-array attempts/worksheets to empty arrays', (assert) => {
    const result = migrate({ schemaVersion: 1, attempts: 'nope', worksheets: null });
    assert.deepEqual(result.attempts, []);
    assert.deepEqual(result.worksheets, []);
  });

  QUnit.test('migrate defaults a document with no schemaVersion to version 1', (assert) => {
    const result = migrate({ attempts: [], worksheets: [] });
    assert.equal(result.schemaVersion, CURRENT_SCHEMA_VERSION);
  });
});
