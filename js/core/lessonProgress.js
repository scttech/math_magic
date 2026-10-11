// Per-profile lesson progress: which checkpoints (identified by their index
// in a lesson's blocks array) a student has answered correctly at least once.
// A lesson is "completed" once every checkpoint it contains has been gotten
// right — checkpoints stay ungated/retry-able, so this is purely a status
// signal for the roadmap, never a lock on moving ahead.
import { getProgress, setProgress } from './progressStore.js';

export function checkpointBlockIndices(lesson) {
  const indices = [];
  lesson.blocks.forEach((block, index) => {
    if (block.type === 'checkpoint') indices.push(index);
  });
  return indices;
}

/** Marks one checkpoint (by its block index within the lesson) as answered correctly. Idempotent. */
export function recordCheckpointCorrect(profileId, lessonId, blockIndex) {
  const doc = getProgress(profileId);
  const existing = doc.lessons[lessonId]?.checkpointsCorrect || [];
  if (!existing.includes(blockIndex)) {
    doc.lessons[lessonId] = { checkpointsCorrect: [...existing, blockIndex].sort((a, b) => a - b) };
    setProgress(profileId, doc);
  }
  return doc.lessons[lessonId];
}

/** @returns {'not-started'|'in-progress'|'completed'} */
export function getLessonStatus(profileId, lesson) {
  const totalCheckpoints = checkpointBlockIndices(lesson).length;
  if (totalCheckpoints === 0) return 'not-started';
  const doc = getProgress(profileId);
  const correctCount = doc.lessons[lesson.id]?.checkpointsCorrect?.length || 0;
  if (correctCount === 0) return 'not-started';
  if (correctCount >= totalCheckpoints) return 'completed';
  return 'in-progress';
}
