// Grade-agnostic division-fact drill — same architecture as
// multiplicationTables.js (multiple choice, outside the grade/topic registry).
// Builds from a divisor and a quotient (both without remainder), the same way
// multiplication facts build from two factors — so a divisor spec of "1-12"
// and a quotient spec of "1-12" drills the inverse of the 1-12 times tables.
import { randomChoice } from '../core/rng.js';
import { buildChoiceSet } from './numericChoices.js';

export const GENERATOR_ID = 'skills.divisionFacts';
export const MIN_DIVISOR = 1;
export const MAX_DIVISOR = 20;
export const MIN_QUOTIENT = 0;
export const MAX_QUOTIENT = 20;

/** One multiple-choice division problem: a divisor and quotient from each pool, plus 3 plausible wrong answers. */
export function generateProblem(rng, divisors, quotients) {
  const divisor = randomChoice(rng, divisors);
  const quotient = randomChoice(rng, quotients);
  const dividend = divisor * quotient;

  // Plausible wrong answers: mixing up the operation (multiplying or
  // subtracting instead of dividing), and near misses around the correct quotient.
  const candidates = [dividend * divisor, dividend - divisor, quotient + 1, quotient - 1, quotient + 2, quotient - 2];
  const choices = buildChoiceSet(rng, quotient, candidates);

  return { divisor, quotient, dividend, promptText: `${dividend} ÷ ${divisor}`, answer: quotient, answerDisplay: String(quotient), choices };
}
