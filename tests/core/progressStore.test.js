import { getProgress, setProgress, recordQuizAttempt, recordWorksheetGenerated, resetProgress } from '../../js/core/progressStore.js';
import { CURRENT_SCHEMA_VERSION } from '../../js/core/schemaMigrations.js';

QUnit.module('core/progressStore', (hooks) => {
  hooks.beforeEach(() => localStorage.clear());

  QUnit.test('getProgress returns an empty document when nothing is stored', (assert) => {
    assert.deepEqual(getProgress('profile_x'), { schemaVersion: CURRENT_SCHEMA_VERSION, attempts: [], worksheets: [] });
  });

  QUnit.test('setProgress + getProgress round-trips (through migrate)', (assert) => {
    const doc = { schemaVersion: 1, attempts: [{ attemptId: 'a1' }], worksheets: [] };
    setProgress('profile_x', doc);
    assert.deepEqual(getProgress('profile_x'), doc);
  });

  QUnit.test('getProgress recovers from corrupt JSON in storage', (assert) => {
    localStorage.setItem('mathmagic.progress.profile_x', 'not json{{{');
    assert.deepEqual(getProgress('profile_x'), { schemaVersion: CURRENT_SCHEMA_VERSION, attempts: [], worksheets: [] });
  });

  QUnit.test('recordQuizAttempt appends an attempt with a generated attemptId', (assert) => {
    const attempt = recordQuizAttempt('profile_x', {
      grade: '6',
      topics: ['fractionsDecimals'],
      difficulty: 'easy',
      startedAt: '2026-01-01T00:00:00.000Z',
      completedAt: '2026-01-01T00:05:00.000Z',
      problems: [{ generatorId: 'grade6.fractionsDecimals.addSubtractFractions', difficulty: 'easy', seed: 1, correct: true, userAnswer: '1/2', timeMs: 1000 }],
    });

    assert.ok(attempt.attemptId.startsWith('atmp_'));
    assert.equal(attempt.type, 'quiz');
    const doc = getProgress('profile_x');
    assert.equal(doc.attempts.length, 1);
    assert.equal(doc.attempts[0].attemptId, attempt.attemptId);
  });

  QUnit.test('recordWorksheetGenerated appends a worksheet with a generated worksheetId', (assert) => {
    const worksheet = recordWorksheetGenerated('profile_x', {
      grade: '6',
      topics: ['areaSurfaceVolume'],
      difficulty: 'hard',
      problemCount: 15,
      seed: 12345,
    });

    assert.ok(worksheet.worksheetId.startsWith('wksh_'));
    assert.ok(worksheet.createdAt);
    const doc = getProgress('profile_x');
    assert.equal(doc.worksheets.length, 1);
    assert.equal(doc.worksheets[0].worksheetId, worksheet.worksheetId);
  });

  QUnit.test('recordQuizAttempt and recordWorksheetGenerated accumulate across calls', (assert) => {
    recordQuizAttempt('profile_x', { grade: '6', topics: [], difficulty: 'easy', startedAt: '', completedAt: '', problems: [] });
    recordQuizAttempt('profile_x', { grade: '6', topics: [], difficulty: 'easy', startedAt: '', completedAt: '', problems: [] });
    recordWorksheetGenerated('profile_x', { grade: '6', topics: [], difficulty: 'easy', problemCount: 10, seed: 1 });

    const doc = getProgress('profile_x');
    assert.equal(doc.attempts.length, 2);
    assert.equal(doc.worksheets.length, 1);
  });

  QUnit.test('resetProgress clears stored progress back to empty', (assert) => {
    recordQuizAttempt('profile_x', { grade: '6', topics: [], difficulty: 'easy', startedAt: '', completedAt: '', problems: [] });
    resetProgress('profile_x');
    assert.deepEqual(getProgress('profile_x').attempts, []);
  });

  QUnit.test('progress is isolated per profile id', (assert) => {
    recordQuizAttempt('profile_a', { grade: '6', topics: [], difficulty: 'easy', startedAt: '', completedAt: '', problems: [] });
    assert.equal(getProgress('profile_a').attempts.length, 1);
    assert.equal(getProgress('profile_b').attempts.length, 0);
  });
});
