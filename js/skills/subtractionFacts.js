// Grade-agnostic subtraction-fact drill — same architecture as
// multiplicationTables.js (multiple choice, outside the grade/topic registry).
import { randomChoice } from '../core/rng.js';
import { buildChoiceSet } from './numericChoices.js';

export const GENERATOR_ID = 'skills.subtractionFacts';
export const MIN_VALUE = 0;
export const MAX_VALUE = 50;

/** One multiple-choice subtraction problem: two numbers (larger minus smaller), plus 3 plausible wrong answers. */
export function generateProblem(rng, numbersA, numbersB) {
  let a = randomChoice(rng, numbersA);
  let b = randomChoice(rng, numbersB);
  if (a < b) [a, b] = [b, a];
  const correct = a - b;

  // Plausible wrong answers: mixing up the operation (adding or multiplying
  // instead of subtracting), and near misses around the correct difference.
  const candidates = [a + b, a * b, correct + 1, correct - 1, correct + 2, correct - 2];
  const choices = buildChoiceSet(rng, correct, candidates);

  return { a, b, promptText: `${a} - ${b}`, answer: correct, answerDisplay: String(correct), choices };
}
