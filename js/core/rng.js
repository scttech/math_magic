// Deterministic PRNG (mulberry32). Generator modules must only source randomness
// through an rng() created here, never Math.random(), so problems are reproducible
// from a seed (needed for worksheet reprints and QUnit fixed-seed assertions).

/**
 * @param {number} seed - any 32-bit integer (values are coerced with >>> 0)
 * @returns {() => number} a function returning a float in [0, 1), like Math.random()
 */
export function createRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Random integer in [min, max], inclusive. */
export function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Random element from a non-empty array. */
export function randomChoice(rng, arr) {
  return arr[randomInt(rng, 0, arr.length - 1)];
}

/** Fisher-Yates shuffle using the given rng; returns a new array, does not mutate input. */
export function shuffle(rng, arr) {
  const result = arr.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(rng, 0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Generate a random seed suitable for a new quiz attempt or worksheet. */
export function randomSeed() {
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}
