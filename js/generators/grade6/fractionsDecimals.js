import { randomInt, randomChoice } from '../../core/rng.js';
import {
  reduceFraction,
  formatFraction,
  formatMixedNumber,
  addFractions,
  subFractions,
  mulFractions,
  divFractions,
  roundTo,
  numericCheckAnswer,
  fractionCheckAnswer,
} from '../../core/problemGenerator.js';

const GRADE = '6';
const TOPIC = 'fractionsDecimals';

/** Random proper (or improper, if allowImproper) fraction with denominator in the given range. */
function randomFraction(rng, { minDen, maxDen, maxNum, allowImproper = false }) {
  const den = randomInt(rng, minDen, maxDen);
  const num = allowImproper ? randomInt(rng, 1, maxNum) : randomInt(rng, 1, Math.min(den - 1, maxNum) || 1);
  return { num, den };
}

const addSubtractFractions = {
  id: 'grade6.fractionsDecimals.addSubtractFractions',
  grade: GRADE,
  topic: TOPIC,
  label: 'Adding & Subtracting Fractions',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const op = randomChoice(rng, ['add', 'subtract']);
    let a, b;
    if (difficulty === 'easy') {
      const den = randomInt(rng, 2, 10);
      a = { num: randomInt(rng, 1, den - 1), den };
      b = { num: randomInt(rng, 1, den - 1), den };
    } else if (difficulty === 'medium') {
      const baseDen = randomInt(rng, 2, 6);
      a = { num: randomInt(rng, 1, baseDen - 1), den: baseDen };
      b = { num: randomInt(rng, 1, baseDen * 2 - 1), den: baseDen * randomInt(rng, 2, 3) };
    } else {
      a = randomFraction(rng, { minDen: 2, maxDen: 12, maxNum: 20, allowImproper: true });
      b = randomFraction(rng, { minDen: 2, maxDen: 12, maxNum: 20, allowImproper: true });
    }
    if (op === 'subtract' && a.num / a.den < b.num / b.den) {
      [a, b] = [b, a];
    }
    const result = op === 'add' ? addFractions(a, b) : subFractions(a, b);
    const symbol = op === 'add' ? '+' : '-';
    const formatFn = difficulty === 'hard' ? formatMixedNumber : formatFraction;
    return {
      promptText: `${formatFn(a)} ${symbol} ${formatFn(b)} = ?`,
      answer: result,
      answerDisplay: formatFn(result),
      checkAnswer: fractionCheckAnswer(result),
      meta: { generatorId: addSubtractFractions.id, difficulty },
    };
  },
};

const multiplyFractions = {
  id: 'grade6.fractionsDecimals.multiplyFractions',
  grade: GRADE,
  topic: TOPIC,
  label: 'Multiplying Fractions',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const ranges = {
      easy: { minDen: 2, maxDen: 6, maxNum: 5, allowImproper: false },
      medium: { minDen: 2, maxDen: 10, maxNum: 9, allowImproper: false },
      hard: { minDen: 2, maxDen: 10, maxNum: 15, allowImproper: true },
    };
    const range = ranges[difficulty] || ranges.medium;
    const a = randomFraction(rng, range);
    const b = randomFraction(rng, range);
    const result = mulFractions(a, b);
    const formatFn = difficulty === 'hard' ? formatMixedNumber : formatFraction;
    return {
      promptText: `${formatFn(a)} × ${formatFn(b)} = ?`,
      answer: result,
      answerDisplay: formatFn(result),
      checkAnswer: fractionCheckAnswer(result),
      meta: { generatorId: multiplyFractions.id, difficulty },
    };
  },
};

const divideFractions = {
  id: 'grade6.fractionsDecimals.divideFractions',
  grade: GRADE,
  topic: TOPIC,
  label: 'Dividing Fractions',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const ranges = {
      easy: { minDen: 2, maxDen: 6, maxNum: 5, allowImproper: false },
      medium: { minDen: 2, maxDen: 10, maxNum: 9, allowImproper: false },
      hard: { minDen: 2, maxDen: 10, maxNum: 15, allowImproper: true },
    };
    const range = ranges[difficulty] || ranges.medium;
    const a = randomFraction(rng, range);
    let b = randomFraction(rng, range);
    if (b.num === 0) b = { ...b, num: 1 };
    const result = divFractions(a, b);
    const formatFn = difficulty === 'hard' ? formatMixedNumber : formatFraction;
    return {
      promptText: `${formatFn(a)} ÷ ${formatFn(b)} = ?`,
      answer: result,
      answerDisplay: formatFn(result),
      checkAnswer: fractionCheckAnswer(result),
      meta: { generatorId: divideFractions.id, difficulty },
    };
  },
};

const addSubtractDecimals = {
  id: 'grade6.fractionsDecimals.addSubtractDecimals',
  grade: GRADE,
  topic: TOPIC,
  label: 'Adding & Subtracting Decimals',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const decimalPlaces = difficulty === 'easy' ? 1 : 2;
    const maxWhole = difficulty === 'hard' ? 200 : 20;
    const scale = 10 ** decimalPlaces;
    let a = randomInt(rng, 0, maxWhole * scale) / scale;
    let b = randomInt(rng, 0, maxWhole * scale) / scale;
    const op = randomChoice(rng, ['add', 'subtract']);
    if (op === 'subtract' && a < b) [a, b] = [b, a];
    const result = roundTo(op === 'add' ? a + b : a - b, decimalPlaces);
    const symbol = op === 'add' ? '+' : '-';
    return {
      promptText: `${a.toFixed(decimalPlaces)} ${symbol} ${b.toFixed(decimalPlaces)} = ?`,
      answer: result,
      answerDisplay: result.toFixed(decimalPlaces),
      checkAnswer: numericCheckAnswer(result, 0.5 / scale),
      meta: { generatorId: addSubtractDecimals.id, difficulty },
    };
  },
};

const multiplyDivideDecimals = {
  id: 'grade6.fractionsDecimals.multiplyDivideDecimals',
  grade: GRADE,
  topic: TOPIC,
  label: 'Multiplying & Dividing Decimals',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const op = randomChoice(rng, ['multiply', 'divide']);
    if (op === 'multiply') {
      const decimalPlaces = difficulty === 'easy' ? 1 : 2;
      const scale = 10 ** decimalPlaces;
      const a = randomInt(rng, 1, difficulty === 'hard' ? 50 * scale : 20 * scale) / scale;
      const b = difficulty === 'easy' ? randomInt(rng, 2, 9) : randomInt(rng, 1, 9 * scale) / scale;
      const result = roundTo(a * b, decimalPlaces + (difficulty === 'easy' ? 0 : decimalPlaces));
      return {
        promptText: `${a} × ${b} = ?`,
        answer: result,
        answerDisplay: `${result}`,
        checkAnswer: numericCheckAnswer(result, 1e-6),
        meta: { generatorId: multiplyDivideDecimals.id, difficulty },
      };
    }
    const divisor = difficulty === 'easy' ? randomInt(rng, 2, 9) : randomInt(rng, 2, 20) / (difficulty === 'hard' ? 10 : 1);
    const quotientDecimalPlaces = difficulty === 'easy' ? 0 : 1;
    const quotient = randomInt(rng, 1, 20 * 10 ** quotientDecimalPlaces) / 10 ** quotientDecimalPlaces;
    const dividend = roundTo(divisor * quotient, 4);
    const result = roundTo(quotient, 3);
    return {
      promptText: `${dividend} ÷ ${divisor} = ?`,
      answer: result,
      answerDisplay: `${result}`,
      checkAnswer: numericCheckAnswer(result, 1e-3),
      meta: { generatorId: multiplyDivideDecimals.id, difficulty },
    };
  },
};

const TERMINATING_DENOMINATORS = [2, 4, 5, 8, 10, 20, 25, 50];

const fractionDecimalConversion = {
  id: 'grade6.fractionsDecimals.fractionDecimalConversion',
  grade: GRADE,
  topic: TOPIC,
  label: 'Converting Fractions & Decimals',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const denPool =
      difficulty === 'easy' ? [2, 4, 5, 10] : difficulty === 'medium' ? [2, 4, 5, 8, 10, 20] : TERMINATING_DENOMINATORS;
    const den = randomChoice(rng, denPool);
    const num = randomInt(rng, 1, den - 1);
    const fraction = reduceFraction(num, den);
    const decimalValue = roundTo(fraction.num / fraction.den, 4);
    const direction = randomChoice(rng, ['toDecimal', 'toFraction']);
    if (direction === 'toDecimal') {
      return {
        promptText: `Write ${formatFraction(fraction)} as a decimal.`,
        answer: decimalValue,
        answerDisplay: `${decimalValue}`,
        checkAnswer: numericCheckAnswer(decimalValue, 1e-4),
        meta: { generatorId: fractionDecimalConversion.id, difficulty },
      };
    }
    return {
      promptText: `Write ${decimalValue} as a fraction in lowest terms.`,
      answer: fraction,
      answerDisplay: formatFraction(fraction),
      checkAnswer: fractionCheckAnswer(fraction),
      meta: { generatorId: fractionDecimalConversion.id, difficulty },
    };
  },
};

export const generators = [
  addSubtractFractions,
  multiplyFractions,
  divideFractions,
  addSubtractDecimals,
  multiplyDivideDecimals,
  fractionDecimalConversion,
];
