// Grade-agnostic multiplication-table drill. Deliberately outside the
// grade/topic registry (registry.js): it doesn't fit the free-text quiz
// contract (multiple choice, not typed answers) and isn't scoped to one
// grade, so it gets its own small module. Progress is still recorded under
// GENERATOR_ID, which scoring.js's topicOf() resolves via its unregistered-id
// fallback (last dot-segment) so it shows up on the dashboard like any topic.
import { randomChoice, randomInt, shuffle } from '../core/rng.js';

export const GENERATOR_ID = 'skills.multiplicationTables';
export const MIN_FACTOR = 0;
export const MAX_FACTOR = 20;

/**
 * Parse a factor spec into a sorted array of unique integers. Accepts a
 * single number ("2"), a comma-separated list ("2,4,6"), a range ("1-12"),
 * or a mix ("2,5-7"). Returns null if the spec is empty or any token is
 * invalid or outside [MIN_FACTOR, MAX_FACTOR].
 */
export function parseFactorSpec(spec) {
  if (typeof spec !== 'string') return null;
  const parts = spec
    .trim()
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return null;

  const values = new Set();
  for (const part of parts) {
    const rangeMatch = /^(\d+)\s*-\s*(\d+)$/.exec(part);
    if (rangeMatch) {
      let lo = Number(rangeMatch[1]);
      let hi = Number(rangeMatch[2]);
      if (lo > hi) [lo, hi] = [hi, lo];
      if (lo < MIN_FACTOR || hi > MAX_FACTOR) return null;
      for (let v = lo; v <= hi; v++) values.add(v);
    } else if (/^\d+$/.test(part)) {
      const v = Number(part);
      if (v < MIN_FACTOR || v > MAX_FACTOR) return null;
      values.add(v);
    } else {
      return null;
    }
  }
  return values.size > 0 ? Array.from(values).sort((a, b) => a - b) : null;
}

function distractorCandidates(a, b, correct) {
  return [a * (b - 1), a * (b + 1), (a - 1) * b, (a + 1) * b, correct + a, correct - a, correct + b, correct - b, correct + 1, correct - 1];
}

/** One multiple-choice multiplication problem: a factor from each pool, plus 3 plausible wrong answers. */
export function generateProblem(rng, factorsA, factorsB) {
  const a = randomChoice(rng, factorsA);
  const b = randomChoice(rng, factorsB);
  const correct = a * b;

  const pool = new Set();
  for (const candidate of shuffle(rng, distractorCandidates(a, b, correct))) {
    if (Number.isInteger(candidate) && candidate >= 0 && candidate !== correct) pool.add(candidate);
  }
  let attempts = 0;
  while (pool.size < 3 && attempts < 100) {
    attempts += 1;
    const offset = randomInt(rng, 1, 12) * (rng() < 0.5 ? -1 : 1);
    const candidate = correct + offset;
    if (candidate >= 0 && candidate !== correct) pool.add(candidate);
  }

  const distractors = Array.from(pool).slice(0, 3);
  const choices = shuffle(rng, [correct, ...distractors]).map(String);

  return { a, b, promptText: `${a} × ${b}`, answer: correct, answerDisplay: String(correct), choices };
}
