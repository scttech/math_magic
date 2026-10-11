import { recordCheckpointCorrect, getLessonStatus, getTopicStatus, checkpointBlockIndices } from '../../js/core/lessonProgress.js';
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

const oneCheckpointLesson = { id: 'test-lesson-2', blocks: [{ type: 'checkpoint', difficulty: 'easy' }] };

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

  QUnit.test('getTopicStatus: not-started when no lesson in the topic has begun', (assert) => {
    assert.equal(getTopicStatus('profile_x', [lesson, oneCheckpointLesson]), 'not-started');
  });

  QUnit.test('getTopicStatus: in-progress when at least one lesson has started but not every lesson is complete', (assert) => {
    recordCheckpointCorrect('profile_x', oneCheckpointLesson.id, 0);
    assert.equal(getTopicStatus('profile_x', [lesson, oneCheckpointLesson]), 'in-progress');
  });

  QUnit.test('getTopicStatus: in-progress when one lesson is fully completed but another has not started', (assert) => {
    recordCheckpointCorrect('profile_x', oneCheckpointLesson.id, 0);
    assert.equal(getTopicStatus('profile_x', [lesson, oneCheckpointLesson]), 'in-progress', 'completed + not-started is still in-progress overall');
  });

  QUnit.test('getTopicStatus: completed only once every lesson in the topic is completed', (assert) => {
    recordCheckpointCorrect('profile_x', lesson.id, 1);
    recordCheckpointCorrect('profile_x', lesson.id, 3);
    recordCheckpointCorrect('profile_x', lesson.id, 4);
    recordCheckpointCorrect('profile_x', oneCheckpointLesson.id, 0);
    assert.equal(getTopicStatus('profile_x', [lesson, oneCheckpointLesson]), 'completed');
  });

  QUnit.test('getTopicStatus: not-started for a topic with no lessons', (assert) => {
    assert.equal(getTopicStatus('profile_x', []), 'not-started');
  });
});
