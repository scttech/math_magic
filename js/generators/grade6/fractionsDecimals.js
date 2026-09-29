import { randomInt, randomChoice } from '../../core/rng.js';
import {
  gcd,
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
    const answerDisplay = formatFn(result);
    return {
      promptText: `${formatFn(a)} ${symbol} ${formatFn(b)} = ?`,
      answer: result,
      answerDisplay,
      checkAnswer: fractionCheckAnswer(result),
      meta: { generatorId: addSubtractFractions.id, difficulty, a, b, op, answerDisplay },
    };
  },
  explain(meta) {
    const { a, b, op, difficulty, answerDisplay } = meta;
    const formatFn = difficulty === 'hard' ? formatMixedNumber : formatFraction;
    const commonDen = (a.den * b.den) / gcd(a.den, b.den);
    const aScaled = { num: a.num * (commonDen / a.den), den: commonDen };
    const bScaled = { num: b.num * (commonDen / b.den), den: commonDen };
    const combinedNum = op === 'add' ? aScaled.num + bScaled.num : aScaled.num - bScaled.num;
    const symbol = op === 'add' ? '+' : '−';
    return {
      strategy: [
        'Find a common denominator for both fractions.',
        'Rewrite each fraction using that common denominator.',
        `${op === 'add' ? 'Add' : 'Subtract'} the numerators, keeping the common denominator.`,
        'Simplify the result if it can be reduced.',
      ],
      workedSteps: [
        `The common denominator of ${formatFn(a)} and ${formatFn(b)} is ${commonDen}.`,
        `Rewrite each fraction over ${commonDen}: ${formatFraction(aScaled)} and ${formatFraction(bScaled)}.`,
        `${op === 'add' ? 'Add' : 'Subtract'} the numerators: ${aScaled.num} ${symbol} ${bScaled.num} = ${combinedNum}, giving ${formatFraction({ num: combinedNum, den: commonDen })}.`,
        `Simplified, that's ${answerDisplay}.`,
      ],
      finalAnswerDisplay: answerDisplay,
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
    const answerDisplay = formatFn(result);
    return {
      promptText: `${formatFn(a)} × ${formatFn(b)} = ?`,
      answer: result,
      answerDisplay,
      checkAnswer: fractionCheckAnswer(result),
      meta: { generatorId: multiplyFractions.id, difficulty, a, b, answerDisplay },
    };
  },
  explain(meta) {
    const { a, b, answerDisplay } = meta;
    return {
      strategy: [
        'Multiply the numerators together to get the new numerator.',
        'Multiply the denominators together to get the new denominator.',
        'Simplify the result if it can be reduced.',
      ],
      workedSteps: [
        `Multiply the numerators: ${a.num} × ${b.num} = ${a.num * b.num}.`,
        `Multiply the denominators: ${a.den} × ${b.den} = ${a.den * b.den}.`,
        `That's ${formatFraction({ num: a.num * b.num, den: a.den * b.den })}, which simplifies to ${answerDisplay}.`,
      ],
      finalAnswerDisplay: answerDisplay,
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
    const answerDisplay = formatFn(result);
    return {
      promptText: `${formatFn(a)} ÷ ${formatFn(b)} = ?`,
      answer: result,
      answerDisplay,
      checkAnswer: fractionCheckAnswer(result),
      meta: { generatorId: divideFractions.id, difficulty, a, b, answerDisplay },
    };
  },
  explain(meta) {
    const { a, b, answerDisplay } = meta;
    const reciprocalB = { num: b.den, den: b.num };
    return {
      strategy: [
        'Keep the first fraction the same.',
        'Flip (find the reciprocal of) the second fraction.',
        'Multiply the two fractions.',
        'Simplify the result if it can be reduced.',
      ],
      workedSteps: [
        `Flip the second fraction: ${formatFraction(b)} becomes ${formatFraction(reciprocalB)}.`,
        `Multiply: ${formatFraction(a)} × ${formatFraction(reciprocalB)} = ${formatFraction({ num: a.num * reciprocalB.num, den: a.den * reciprocalB.den })}.`,
        `Simplified, that's ${answerDisplay}.`,
      ],
      finalAnswerDisplay: answerDisplay,
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
    const answerDisplay = result.toFixed(decimalPlaces);
    return {
      promptText: `${a.toFixed(decimalPlaces)} ${symbol} ${b.toFixed(decimalPlaces)} = ?`,
      answer: result,
      answerDisplay,
      checkAnswer: numericCheckAnswer(result, 0.5 / scale),
      meta: { generatorId: addSubtractDecimals.id, difficulty, a, b, op, decimalPlaces, answerDisplay },
    };
  },
  explain(meta) {
    const { a, b, op, decimalPlaces, answerDisplay } = meta;
    const symbol = op === 'add' ? '+' : '−';
    return {
      strategy: [
        'Line up the decimal points.',
        `${op === 'add' ? 'Add' : 'Subtract'} the numbers just like whole numbers, column by column.`,
        'Bring the decimal point straight down into the answer.',
      ],
      workedSteps: [
        `Line up the decimal points: ${a.toFixed(decimalPlaces)} and ${b.toFixed(decimalPlaces)}.`,
        `${op === 'add' ? 'Add' : 'Subtract'}: ${a.toFixed(decimalPlaces)} ${symbol} ${b.toFixed(decimalPlaces)} = ${answerDisplay}.`,
      ],
      finalAnswerDisplay: answerDisplay,
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
      const answerDisplay = `${result}`;
      return {
        promptText: `${a} × ${b} = ?`,
        answer: result,
        answerDisplay,
        checkAnswer: numericCheckAnswer(result, 1e-6),
        meta: { generatorId: multiplyDivideDecimals.id, difficulty, op: 'multiply', a, b, answerDisplay },
      };
    }
    const divisor = difficulty === 'easy' ? randomInt(rng, 2, 9) : randomInt(rng, 2, 20) / (difficulty === 'hard' ? 10 : 1);
    const quotientDecimalPlaces = difficulty === 'easy' ? 0 : 1;
    const quotient = randomInt(rng, 1, 20 * 10 ** quotientDecimalPlaces) / 10 ** quotientDecimalPlaces;
    const dividend = roundTo(divisor * quotient, 4);
    const result = roundTo(quotient, 3);
    const answerDisplay = `${result}`;
    return {
      promptText: `${dividend} ÷ ${divisor} = ?`,
      answer: result,
      answerDisplay,
      checkAnswer: numericCheckAnswer(result, 1e-3),
      meta: { generatorId: multiplyDivideDecimals.id, difficulty, op: 'divide', dividend, divisor, answerDisplay },
    };
  },
  explain(meta) {
    const { op, answerDisplay } = meta;
    if (op === 'multiply') {
      const { a, b } = meta;
      return {
        strategy: [
          'Multiply the numbers as if there were no decimal points.',
          'Count the total number of decimal places in both factors.',
          'Place the decimal point that many places from the right in the answer.',
        ],
        workedSteps: [`Multiply: ${a} × ${b} = ${answerDisplay}.`],
        finalAnswerDisplay: answerDisplay,
      };
    }
    const { dividend, divisor } = meta;
    return {
      strategy: [
        'If the divisor has a decimal point, multiply both the divisor and dividend by a power of 10 to make the divisor a whole number.',
        'Divide as usual, keeping the decimal point in line.',
      ],
      workedSteps: [`Divide: ${dividend} ÷ ${divisor} = ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
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
      const answerDisplay = `${decimalValue}`;
      return {
        promptText: `Write ${formatFraction(fraction)} as a decimal.`,
        answer: decimalValue,
        answerDisplay,
        checkAnswer: numericCheckAnswer(decimalValue, 1e-4),
        meta: { generatorId: fractionDecimalConversion.id, difficulty, direction, fraction, decimalValue, answerDisplay },
      };
    }
    const answerDisplay = formatFraction(fraction);
    return {
      promptText: `Write ${decimalValue} as a fraction in lowest terms.`,
      answer: fraction,
      answerDisplay,
      checkAnswer: fractionCheckAnswer(fraction),
      meta: { generatorId: fractionDecimalConversion.id, difficulty, direction, fraction, decimalValue, answerDisplay },
    };
  },
  explain(meta) {
    const { direction, fraction, decimalValue, answerDisplay } = meta;
    if (direction === 'toDecimal') {
      return {
        strategy: ['Divide the numerator by the denominator.', 'The result is the decimal form of the fraction.'],
        workedSteps: [`Divide: ${fraction.num} ÷ ${fraction.den} = ${answerDisplay}.`],
        finalAnswerDisplay: answerDisplay,
      };
    }
    const decimalStr = String(decimalValue);
    const decimalPlaces = decimalStr.includes('.') ? decimalStr.split('.')[1].length : 0;
    const rawDenominator = 10 ** decimalPlaces;
    const rawNumerator = Math.round(decimalValue * rawDenominator);
    return {
      strategy: [
        'Count the decimal places to find the power of 10 for the denominator.',
        'Write the decimal digits (without the point) as the numerator.',
        'Simplify the fraction to lowest terms.',
      ],
      workedSteps: [
        `${decimalValue} has ${decimalPlaces} decimal place(s), so write it as ${rawNumerator}/${rawDenominator}.`,
        `Simplify to lowest terms: ${answerDisplay}.`,
      ],
      finalAnswerDisplay: answerDisplay,
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
