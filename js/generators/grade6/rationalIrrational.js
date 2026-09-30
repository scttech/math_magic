import { randomInt, randomChoice } from '../../core/rng.js';
import { numericCheckAnswer, roundTo } from '../../core/problemGenerator.js';

const GRADE = '6';
const TOPIC = 'rationalIrrational';

function randomNonZeroInt(rng, min, max) {
  let value = 0;
  while (value === 0) value = randomInt(rng, min, max);
  return value;
}

function isPerfectSquare(n) {
  const root = Math.round(Math.sqrt(n));
  return root * root === n;
}

/** A random integer in [min, max] that is NOT a perfect square. */
function randomNonPerfectSquare(rng, min, max) {
  let n = randomInt(rng, min, max);
  while (isPerfectSquare(n)) n = randomInt(rng, min, max);
  return n;
}

function betweenCheckAnswer(lower, upper) {
  return (userInput) => {
    if (typeof userInput !== 'string') return false;
    // lower/upper are always non-negative here, so a bare hyphen (as in a
    // natural "4-5" answer) is a range separator, not a minus sign — matching
    // only \d+ (no leading -?) avoids misreading it as 4 and -5.
    const nums = (userInput.match(/\d+/g) || []).map(Number);
    const set = new Set(nums);
    return set.size === 2 && set.has(lower) && set.has(upper);
  };
}

// --- Classifying rational vs. irrational -----------------------------------

function randomRationalExample(rng, difficulty) {
  const maxWhole = difficulty === 'easy' ? 12 : difficulty === 'medium' ? 30 : 60;
  const kind = randomChoice(rng, ['integer', 'fraction', 'terminatingDecimal', 'repeatingDecimal', 'perfectSquareRoot']);

  if (kind === 'integer') {
    const n = randomInt(rng, -maxWhole, maxWhole);
    return { display: `${n}`, detail: `${n} is a whole number, and every whole number can be written as a fraction (${n}/1).` };
  }
  if (kind === 'fraction') {
    const den = randomInt(rng, 2, 12);
    const num = randomNonZeroInt(rng, -(den * 3), den * 3);
    return { display: `${num}/${den}`, detail: `${num}/${den} is already written as a fraction of two integers.` };
  }
  if (kind === 'terminatingDecimal') {
    const scale = randomChoice(rng, [10, 100]);
    const n = randomInt(rng, -maxWhole * scale, maxWhole * scale) / scale;
    return { display: `${n}`, detail: `${n} stops (terminates), so it can be written as a fraction over a power of 10.` };
  }
  if (kind === 'repeatingDecimal') {
    const digit = randomInt(rng, 1, 9);
    return {
      display: `0.${String(digit).repeat(6)}...`,
      detail: `The digit ${digit} repeats forever in the same pattern, so this decimal equals the fraction ${digit}/9.`,
    };
  }
  // perfectSquareRoot — looks irrational (has a root sign) but isn't.
  const squares = difficulty === 'easy' ? [1, 4, 9, 16, 25, 36] : difficulty === 'medium' ? [1, 4, 9, 16, 25, 36, 49, 64, 81, 100] : [1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144];
  const square = randomChoice(rng, squares);
  const root = Math.sqrt(square);
  return { display: `√${square}`, detail: `√${square} = ${root}, a whole number, so it's rational even though it has a root sign.` };
}

function randomIrrationalExample(rng, difficulty) {
  const maxRadicand = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 50 : 100;
  const kind = randomChoice(rng, ['nonPerfectSquareRoot', 'pi']);
  if (kind === 'pi') {
    return { display: 'π', detail: 'π (pi) never terminates and never repeats — its digits go on forever with no pattern.' };
  }
  const radicand = randomNonPerfectSquare(rng, 2, maxRadicand);
  return { display: `√${radicand}`, detail: `${radicand} is not a perfect square, so √${radicand} is a decimal that never terminates or repeats.` };
}

const classifyRationalIrrational = {
  id: 'grade6.rationalIrrational.classify',
  grade: GRADE,
  topic: TOPIC,
  label: 'Classifying Rational & Irrational Numbers',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const isRational = randomChoice(rng, [true, false]);
    const example = isRational ? randomRationalExample(rng, difficulty) : randomIrrationalExample(rng, difficulty);
    const answerDisplay = isRational ? 'Rational' : 'Irrational';
    return {
      promptText: `Is the following number rational or irrational? ${example.display}`,
      answer: answerDisplay,
      answerDisplay,
      checkAnswer: (userInput) => typeof userInput === 'string' && userInput.trim().toLowerCase() === answerDisplay.toLowerCase(),
      meta: { generatorId: classifyRationalIrrational.id, difficulty, display: example.display, detail: example.detail, answerDisplay },
    };
  },
  explain(meta) {
    const { display, detail, answerDisplay } = meta;
    return {
      strategy: [
        'A rational number can be written as a fraction of two integers — this includes whole numbers, fractions, terminating decimals, and repeating decimals.',
        'An irrational number cannot be written as a fraction — its decimal form never terminates and never repeats.',
      ],
      workedSteps: [`Look at ${display}: ${detail}`, `So ${display} is ${answerDisplay.toLowerCase()}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Simplifying a perfect-square root --------------------------------------

const PERFECT_SQUARES_BY_DIFFICULTY = {
  easy: [1, 4, 9, 16, 25, 36],
  medium: [1, 4, 9, 16, 25, 36, 49, 64, 81, 100],
  hard: [1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225],
};

const simplifySquareRoot = {
  id: 'grade6.rationalIrrational.simplifySquareRoot',
  grade: GRADE,
  topic: TOPIC,
  label: 'Simplifying Perfect-Square Roots',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const pool = PERFECT_SQUARES_BY_DIFFICULTY[difficulty] || PERFECT_SQUARES_BY_DIFFICULTY.medium;
    const square = randomChoice(rng, pool);
    const root = Math.sqrt(square);
    const answerDisplay = `${root}`;
    return {
      promptText: `What is √${square}?`,
      answer: root,
      answerDisplay,
      checkAnswer: numericCheckAnswer(root, 1e-9),
      meta: { generatorId: simplifySquareRoot.id, difficulty, square, answerDisplay },
    };
  },
  explain(meta) {
    const { square, answerDisplay } = meta;
    return {
      strategy: ['Find the whole number that, when multiplied by itself, equals the number under the root sign.'],
      workedSteps: [`${answerDisplay} × ${answerDisplay} = ${square}, so √${square} = ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Estimating an irrational square root -----------------------------------

const estimateSquareRoot = {
  id: 'grade6.rationalIrrational.estimateSquareRoot',
  grade: GRADE,
  topic: TOPIC,
  label: 'Estimating Square Roots',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const maxN = difficulty === 'easy' ? 50 : difficulty === 'medium' ? 100 : 200;
    const n = randomNonPerfectSquare(rng, 2, maxN);
    const lower = Math.floor(Math.sqrt(n));
    const upper = lower + 1;
    const answerDisplay = `${lower} and ${upper}`;
    return {
      promptText: `Between which two whole numbers does √${n} lie?`,
      answer: [lower, upper],
      answerDisplay,
      checkAnswer: betweenCheckAnswer(lower, upper),
      meta: { generatorId: estimateSquareRoot.id, difficulty, n, lower, upper, answerDisplay },
    };
  },
  explain(meta) {
    const { n, lower, upper, answerDisplay } = meta;
    return {
      strategy: [
        'Find the perfect square just below the number and the perfect square just above it.',
        'Their square roots are the two whole numbers the answer lies between.',
      ],
      workedSteps: [
        `${lower}² = ${lower * lower} and ${upper}² = ${upper * upper}.`,
        `Since ${lower * lower} < ${n} < ${upper * upper}, √${n} is between ${answerDisplay}.`,
      ],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Comparing an irrational root to a decimal ------------------------------

const compareRationalIrrational = {
  id: 'grade6.rationalIrrational.compareValues',
  grade: GRADE,
  topic: TOPIC,
  label: 'Comparing Rational & Irrational Numbers',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const maxN = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 60 : 100;
    const n = randomNonPerfectSquare(rng, 2, maxN);
    const rootValue = roundTo(Math.sqrt(n), 6);

    const direction = randomChoice(rng, [1, -1]);
    const magnitude = randomInt(rng, 5, 30) / 10;
    let decimalValue = roundTo(rootValue + direction * magnitude, 1);
    if (decimalValue <= 0) decimalValue = roundTo(rootValue + magnitude, 1);

    const symbol = rootValue < decimalValue ? '<' : rootValue > decimalValue ? '>' : '=';
    return {
      promptText: `Compare: √${n} ___ ${decimalValue} (use <, >, or =)`,
      answer: symbol,
      answerDisplay: symbol,
      checkAnswer: (userInput) => typeof userInput === 'string' && userInput.trim() === symbol,
      meta: { generatorId: compareRationalIrrational.id, difficulty, n, rootValue, decimalValue, answerDisplay: symbol },
    };
  },
  explain(meta) {
    const { n, rootValue, decimalValue, answerDisplay } = meta;
    return {
      strategy: ['Estimate the square root as a decimal.', 'Compare that decimal to the other number.'],
      workedSteps: [`√${n} ≈ ${rootValue}.`, `Compare ${rootValue} and ${decimalValue}: ${rootValue} ${answerDisplay} ${decimalValue}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

export const generators = [classifyRationalIrrational, simplifySquareRoot, estimateSquareRoot, compareRationalIrrational];
