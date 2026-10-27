// Grade-agnostic addition-fact drill — same architecture as
// multiplicationTables.js (multiple choice, outside the grade/topic registry).
import { randomChoice } from '../core/rng.js';
import { buildChoiceSet } from './numericChoices.js';

export const GENERATOR_ID = 'skills.additionFacts';
export const MIN_VALUE = 0;
export const MAX_VALUE = 50;

/** One multiple-choice addition problem: an addend from each pool, plus 3 plausible wrong answers. */
export function generateProblem(rng, addendsA, addendsB) {
  const a = randomChoice(rng, addendsA);
  const b = randomChoice(rng, addendsB);
  const correct = a + b;

  // Plausible wrong answers: mixing up the operation (multiplying or
  // subtracting instead of adding), and near misses around the correct sum.
  const candidates = [a * b, Math.abs(a - b), correct + 1, correct - 1, correct + 2, correct - 2, correct + 10, correct - 10];
  const choices = buildChoiceSet(rng, correct, candidates);

  return { a, b, promptText: `${a} + ${b}`, answer: correct, answerDisplay: String(correct), choices };
}
