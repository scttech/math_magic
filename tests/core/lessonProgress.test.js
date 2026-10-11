import { recordCheckpointCorrect, getLessonStatus, checkpointBlockIndices } from '../../js/core/lessonProgress.js';
import { getProgress } from '../../js/core/progressStore.js';

const lesson = {
  id: 'test-lesson',
  blocks: [
    { type: 'text' },
    { type: 'checkpoint', difficulty: 'easy' },
    { type: 'example' },
    { type: 'checkpoint', difficulty: 'medium' },
    { type: 'checkpoint', difficulty: 'hard' },
  ],
};

QUnit.module('core/lessonProgress', (hooks) => {
  hooks.beforeEach(() => localStorage.clear());

  QUnit.test('checkpointBlockIndices returns the index of every checkpoint block', (assert) => {
    assert.deepEqual(checkpointBlockIndices(lesson), [1, 3, 4]);
  });

  QUnit.test('a lesson with no recorded checkpoints is not-started', (assert) => {
    assert.equal(getLessonStatus('profile_x', lesson), 'not-started');
  });

  QUnit.test('recording some but not all checkpoints correct makes a lesson in-progress', (assert) => {
    recordCheckpointCorrect('profile_x', lesson.id, 1);
    assert.equal(getLessonStatus('profile_x', lesson), 'in-progress');
  });

  QUnit.test('recording every checkpoint correct makes a lesson completed', (assert) => {
    recordCheckpointCorrect('profile_x', lesson.id, 1);
    recordCheckpointCorrect('profile_x', lesson.id, 3);
    recordCheckpointCorrect('profile_x', lesson.id, 4);
    assert.equal(getLessonStatus('profile_x', lesson), 'completed');
  });

  QUnit.test('recording the same checkpoint correct twice does not double-count it', (assert) => {
    recordCheckpointCorrect('profile_x', lesson.id, 1);
    recordCheckpointCorrect('profile_x', lesson.id, 1);
    assert.deepEqual(getProgress('profile_x').lessons[lesson.id].checkpointsCorrect, [1]);
  });

  QUnit.test('progress is isolated per profile', (assert) => {
    recordCheckpointCorrect('profile_a', lesson.id, 1);
    assert.equal(getLessonStatus('profile_a', lesson), 'in-progress');
    assert.equal(getLessonStatus('profile_b', lesson), 'not-started');
  });

  QUnit.test('progress is isolated per lesson id', (assert) => {
    recordCheckpointCorrect('profile_x', 'other-lesson', 1);
    assert.equal(getLessonStatus('profile_x', lesson), 'not-started');
  });
});
