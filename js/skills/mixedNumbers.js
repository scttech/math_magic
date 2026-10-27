// Grade-agnostic drill converting between an improper fraction and a mixed
// number, in a randomly-chosen direction each question. Like
// fractionSimplification.js, the answer is a fraction/mixed-number string,
// so distractors are built by hand rather than through numericChoices.js.
import { randomInt, randomChoice, shuffle } from '../core/rng.js';

export const GENERATOR_ID = 'skills.mixedNumbers';
export const MIN_DENOMINATOR = 2;
export const MAX_DENOMINATOR = 20;
const MAX_WHOLE = 9;

function buildChoices(rng, answerDisplay, candidates) {
  const distractors = Array.from(new Set(candidates.filter((c) => c !== answerDisplay))).slice(0, 3);
  return shuffle(rng, [answerDisplay, ...distractors]);
}

/** One multiple-choice problem converting between an improper fraction and a mixed number. */
export function generateProblem(rng, denominators) {
  const denominator = randomChoice(rng, denominators);
  const whole = randomInt(rng, 1, MAX_WHOLE);
  const remainder = randomInt(rng, 1, denominator - 1); // nonzero, so the number is genuinely mixed
  const numerator = whole * denominator + remainder;

  if (rng() < 0.5) {
    const answerDisplay = `${whole} ${remainder}/${denominator}`;
    const candidates = [
      `${numerator}/${denominator}`, // didn't convert at all
      `${whole + 1} ${remainder}/${denominator}`,
      `${whole} ${remainder + 1}/${denominator}`,
      `${whole > 1 ? whole - 1 : whole + 2} ${remainder}/${denominator}`,
    ];
    return {
      numerator,
      denominator,
      promptText: `Write ${numerator}/${denominator} as a mixed number.`,
      answer: answerDisplay,
      answerDisplay,
      choices: buildChoices(rng, answerDisplay, candidates),
    };
  }

  const answerDisplay = `${numerator}/${denominator}`;
  const candidates = [
    `${whole} ${remainder}/${denominator}`, // didn't convert at all
    `${numerator + 1}/${denominator}`,
    `${numerator - 1}/${denominator}`,
    `${whole * denominator}/${denominator}`, // dropped the remainder
  ];
  return {
    whole,
    remainder,
    denominator,
    promptText: `Write ${whole} ${remainder}/${denominator} as an improper fraction.`,
    answer: answerDisplay,
    answerDisplay,
    choices: buildChoices(rng, answerDisplay, candidates),
  };
}
