// Pure deck-building logic for Memory Match, kept separate from
// memoryMatchView.js (which is DOM-heavy) so it's directly unit-testable.
import { createRng } from '../core/rng.js';

const MAX_ATTEMPTS_PER_PAIR = 50;

/**
 * Generates `pairCount` problems from `topic.generate(rng, ...topic.args)`
 * whose prompts AND answers are all unique, so no two pairs can be confused
 * for each other (e.g. two different fraction problems that both simplify to
 * the same value). Returns fewer than `pairCount` problems if the topic's
 * value space is too small to find that many within the attempt budget.
 */
export function buildDeck(topic, pairCount, baseSeed) {
  const problems = [];
  const seenPrompts = new Set();
  const seenAnswers = new Set();
  const maxAttempts = pairCount * MAX_ATTEMPTS_PER_PAIR;
  for (let seedOffset = 0; problems.length < pairCount && seedOffset < maxAttempts; seedOffset++) {
    const problem = topic.generate(createRng(baseSeed + seedOffset), ...topic.args);
    if (seenPrompts.has(problem.promptText) || seenAnswers.has(problem.answerDisplay)) continue;
    seenPrompts.add(problem.promptText);
    seenAnswers.add(problem.answerDisplay);
    problems.push(problem);
  }
  return problems;
}
