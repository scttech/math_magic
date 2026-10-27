// Grade-agnostic fraction-simplification drill — same multiple-choice
// architecture as the fact-fluency skills, but the answer is a fraction
// string rather than a number, so distractors are built by hand here instead
// of through numericChoices.js (which assumes integer answers).
import { randomInt, randomChoice, shuffle } from '../core/rng.js';

export const GENERATOR_ID = 'skills.fractionSimplification';
export const MIN_DENOMINATOR = 4;
export const MAX_DENOMINATOR = 100;

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

/** Whether a denominator has any proper divisor — i.e. whether some fraction over it can ever be reduced. */
export function isReducible(denominator) {
  for (let d = 2; d * d <= denominator; d++) {
    if (denominator % d === 0) return true;
  }
  return false;
}

/** One multiple-choice fraction-simplification problem: a reducible fraction from the given (reducible) denominator pool. */
export function generateProblem(rng, denominators) {
  let denominator, numerator, divisor;
  do {
    denominator = randomChoice(rng, denominators);
    numerator = randomInt(rng, 1, denominator - 1);
    divisor = gcd(numerator, denominator);
  } while (divisor <= 1);

  const simplifiedNum = numerator / divisor;
  const simplifiedDen = denominator / divisor;
  const answerDisplay = `${simplifiedNum}/${simplifiedDen}`;

  // Plausible wrong answers: the unreduced fraction (forgot to simplify),
  // numerator/denominator swapped, and near misses one step off the
  // fully-reduced form.
  const candidates = [
    `${numerator}/${denominator}`,
    `${simplifiedDen}/${simplifiedNum}`,
    `${simplifiedNum + 1}/${simplifiedDen}`,
    `${simplifiedNum}/${simplifiedDen + 1}`,
  ];
  const pool = new Set(candidates.filter((c) => c !== answerDisplay));
  let filler = 1;
  while (pool.size < 3) {
    pool.add(`${simplifiedNum}/${simplifiedDen + 1 + filler}`);
    filler += 1;
  }
  const choices = shuffle(rng, [answerDisplay, ...Array.from(pool).slice(0, 3)]);

  return { numerator, denominator, promptText: `${numerator}/${denominator}`, answer: answerDisplay, answerDisplay, choices };
}
