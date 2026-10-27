import { listLessons } from '../../js/core/lessons.js';
import { checkpointBlockIndices, recordCheckpointCorrect } from '../../js/core/lessonProgress.js';
import { getContinueLearning } from '../../js/app/continueLearning.js';

QUnit.module('app/continueLearning', (hooks) => {
  hooks.beforeEach(() => localStorage.clear());

  QUnit.test('returns null when given no profile id', (assert) => {
    assert.equal(getContinueLearning(null), null);
  });

  QUnit.test('lands on the first lesson in the catalog when nothing has been started yet', (assert) => {
    const firstLesson = listLessons()[0];
    const result = getContinueLearning('profile_fresh');
    assert.equal(result.status, 'not-started');
    assert.equal(result.lesson.id, firstLesson.id);
    assert.equal(result.url, `pages/lesson.html?id=${encodeURIComponent(firstLesson.id)}`);
  });

  QUnit.test('surfaces the first lesson as in-progress once one of its checkpoints is answered correctly', (assert) => {
    const firstLesson = listLessons()[0];
    const firstCheckpointIndex = checkpointBlockIndices(firstLesson)[0];
    recordCheckpointCorrect('profile_x', firstLesson.id, firstCheckpointIndex);

    const result = getContinueLearning('profile_x');
    assert.equal(result.status, 'in-progress');
    assert.equal(result.lesson.id, firstLesson.id);
  });

  QUnit.test('moves on to the next not-started lesson once the first lesson is fully completed', (assert) => {
    const [firstLesson, secondLesson] = listLessons();
    for (const index of checkpointBlockIndices(firstLesson)) {
      recordCheckpointCorrect('profile_y', firstLesson.id, index);
    }

    const result = getContinueLearning('profile_y');
    assert.equal(result.status, 'not-started');
    assert.equal(result.lesson.id, secondLesson.id);
  });

  QUnit.test('returns null once every lesson is completed', (assert) => {
    for (const lesson of listLessons()) {
      for (const index of checkpointBlockIndices(lesson)) {
        recordCheckpointCorrect('profile_z', lesson.id, index);
      }
    }
    assert.equal(getContinueLearning('profile_z'), null);
  });
});
