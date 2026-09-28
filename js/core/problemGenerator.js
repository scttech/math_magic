// Shared contract and math helpers for problem-generator modules.
//
// A ProblemGeneratorModule looks like:
//   {
//     id: "grade6.fractionsDecimals.divideFractions",
//     grade: "6",
//     topic: "fractionsDecimals",
//     label: "Dividing Fractions",
//     difficulties: ["easy", "medium", "hard"],
//     generate({ difficulty, rng }) -> Problem
//   }
//
// A Problem looks like:
//   {
//     promptText: string,
//     answer: number|string|object,      // canonical value used by checkAnswer
//     answerDisplay: string,              // human-readable, for feedback/answer keys
//     choices?: string[],                 // optional, pre-shuffled, for multiple choice
//     checkAnswer(userInput) -> boolean,
//     meta: { generatorId, difficulty, seed }
//   }
//
// Generators must source all randomness from the rng() passed in GenParams —
// never Math.random() — so output is reproducible from a seed.

export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

/** Reduce a fraction to lowest terms, keeping the sign on the numerator. */
export function reduceFraction(num, den) {
  if (den === 0) throw new Error('reduceFraction: denominator is zero');
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const divisor = gcd(num, den);
  return { num: num / divisor, den: den / divisor };
}

export function formatFraction({ num, den }) {
  if (den === 1) return `${num}`;
  return `${num}/${den}`;
}

/** Format an (improper) fraction as a mixed number string, e.g. {num:7,den:4} -> "1 3/4". */
export function formatMixedNumber({ num, den }) {
  const reduced = reduceFraction(num, den);
  if (reduced.den === 1) return `${reduced.num}`;
  const sign = reduced.num < 0 ? -1 : 1;
  const absNum = Math.abs(reduced.num);
  const whole = Math.floor(absNum / reduced.den);
  const remainder = absNum % reduced.den;
  if (whole === 0) return `${sign < 0 ? '-' : ''}${remainder}/${reduced.den}`;
  if (remainder === 0) return `${sign * whole}`;
  return `${sign < 0 ? '-' : ''}${whole} ${remainder}/${reduced.den}`;
}

export function addFractions(a, b) {
  return reduceFraction(a.num * b.den + b.num * a.den, a.den * b.den);
}

export function subFractions(a, b) {
  return reduceFraction(a.num * b.den - b.num * a.den, a.den * b.den);
}

export function mulFractions(a, b) {
  return reduceFraction(a.num * b.num, a.den * b.den);
}

export function divFractions(a, b) {
  if (b.num === 0) throw new Error('divFractions: division by zero');
  return reduceFraction(a.num * b.den, a.den * b.num);
}

export function fractionsEqual(a, b) {
  const ra = reduceFraction(a.num, a.den);
  const rb = reduceFraction(b.num, b.den);
  return ra.num === rb.num && ra.den === rb.den;
}

/** Round a number to a fixed number of decimal places and return it as a number. */
export function roundTo(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Build a checkAnswer function that compares numeric answers within a small
 * floating-point tolerance (for decimal problems where exact equality is fragile).
 */
export function numericCheckAnswer(correctAnswer, tolerance = 1e-9) {
  return (userInput) => {
    const parsed = typeof userInput === 'number' ? userInput : parseFloat(userInput);
    if (Number.isNaN(parsed)) return false;
    return Math.abs(parsed - correctAnswer) <= tolerance;
  };
}

/**
 * Build a checkAnswer function for fraction answers. Accepts "3/8", "-3/8",
 * whole numbers, or a {num, den} object, and compares in reduced form.
 */
export function fractionCheckAnswer(correctFraction) {
  return (userInput) => {
    let candidate = userInput;
    if (typeof userInput === 'string') {
      const trimmed = userInput.trim();
      const mixedMatch = /^(-?)(\d+)\s+(\d+)\/(\d+)$/.exec(trimmed);
      if (mixedMatch) {
        const [, sign, whole, num, den] = mixedMatch;
        const magnitude = Number(whole) * Number(den) + Number(num);
        candidate = { num: sign === '-' ? -magnitude : magnitude, den: Number(den) };
      } else if (/^-?\d+\/\d+$/.test(trimmed)) {
        const [num, den] = trimmed.split('/').map(Number);
        candidate = { num, den };
      } else if (/^-?\d+$/.test(trimmed)) {
        candidate = { num: Number(trimmed), den: 1 };
      } else {
        return false;
      }
    } else if (typeof userInput === 'number') {
      candidate = { num: userInput, den: 1 };
    }
    if (!candidate || typeof candidate.num !== 'number' || typeof candidate.den !== 'number') {
      return false;
    }
    return fractionsEqual(candidate, correctFraction);
  };
}
