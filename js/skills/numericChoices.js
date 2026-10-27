// Shared multiple-choice builder for numeric fact drills (addition, subtraction,
// division — the same shape multiplicationTables.js already does inline).
// Each skill supplies its own "plausible wrong answer" candidates (operand
// off-by-ones, common operation mix-ups); this just dedupes them against the
// correct answer, tops up with random nearby offsets if there aren't enough,
// and returns 4 shuffled string choices.
import { randomInt, shuffle } from '../core/rng.js';

export function buildChoiceSet(rng, correct, candidates, min = 0) {
  const pool = new Set();
  for (const candidate of shuffle(rng, candidates)) {
    if (Number.isInteger(candidate) && candidate >= min && candidate !== correct) pool.add(candidate);
  }
  let attempts = 0;
  while (pool.size < 3 && attempts < 100) {
    attempts += 1;
    const offset = randomInt(rng, 1, 12) * (rng() < 0.5 ? -1 : 1);
    const candidate = correct + offset;
    if (candidate >= min && candidate !== correct) pool.add(candidate);
  }
  const distractors = Array.from(pool).slice(0, 3);
  return shuffle(rng, [correct, ...distractors]).map(String);
}
