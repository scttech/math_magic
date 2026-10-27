import { listCertificateAchievements } from '../../js/app/certificateAchievements.js';

function progressWith(attempts) {
  return { schemaVersion: 3, attempts, worksheets: [], lessons: {}, resolvedMistakes: {} };
}

QUnit.module('app/certificateAchievements', () => {
  QUnit.test('an empty history has no achievements to certify', (assert) => {
    assert.deepEqual(listCertificateAchievements(progressWith([])), []);
  });

  QUnit.test('one perfect attempt earns "First Quiz" and "Perfect Quiz" plus the baseline "Dedicated Practice" achievement', (assert) => {
    const progress = progressWith([{ completedAt: '2026-01-01T00:00:00.000Z', problems: [{ correct: true }] }]);
    const achievements = listCertificateAchievements(progress);
    assert.deepEqual(
      achievements.map((a) => a.id),
      ['first-quiz', 'perfect-quiz', 'dedicated-practice']
    );
  });

  QUnit.test('every achievement has a human-readable label', (assert) => {
    const progress = progressWith([{ completedAt: '2026-01-01T00:00:00.000Z', problems: [{ correct: true }] }]);
    for (const achievement of listCertificateAchievements(progress)) {
      assert.ok(typeof achievement.label === 'string' && achievement.label.length > 0, `"${achievement.id}" has a label`);
    }
  });

  QUnit.test('earning a duel badge adds it to the list', (assert) => {
    const progress = progressWith([{ type: 'duel', completedAt: '2026-01-01T00:00:00.000Z', outcome: 'win', opponentScore: 0, problems: [] }]);
    const ids = listCertificateAchievements(progress).map((a) => a.id);
    assert.ok(ids.includes('first-duel'));
    assert.ok(ids.includes('duel-shutout'));
  });
});
