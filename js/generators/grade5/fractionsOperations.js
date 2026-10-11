// 5.NF: adding/subtracting fractions with unlike denominators, interpreting a
// fraction as division, multiplying fractions, and dividing with unit fractions.
import { randomInt, randomChoice } from '../../core/rng.js';
import { gcd, reduceFraction, formatFraction, formatMixedNumber, addFractions, subFractions, mulFractions, numericCheckAnswer, fractionCheckAnswer } from '../../core/problemGenerator.js';

const GRADE = '5';
const TOPIC = 'fractionsOperations';

function randomFraction(rng, { minDen, maxDen, maxNum, allowImproper = false }) {
  const den = randomInt(rng, minDen, maxDen);
  const num = allowImproper ? randomInt(rng, 1, maxNum) : randomInt(rng, 1, Math.min(den - 1, maxNum) || 1);
  return { num, den };
}

// --- Adding & subtracting fractions with unlike denominators (5.NF.A.1) -------

const addSubtractUnlikeFractions = {
  id: 'grade5.fractionsOperations.addSubtractUnlikeFractions',
  grade: GRADE,
  topic: TOPIC,
  label: 'Adding & Subtracting Fractions',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const op = randomChoice(rng, ['add', 'subtract']);
    let a;
    let b;
    if (difficulty === 'easy') {
      a = randomFraction(rng, { minDen: 2, maxDen: 6, maxNum: 5 });
      b = randomFraction(rng, { minDen: 2, maxDen: 6, maxNum: 5 });
      while (b.den === a.den) b = randomFraction(rng, { minDen: 2, maxDen: 6, maxNum: 5 });
    } else if (difficulty === 'medium') {
      a = randomFraction(rng, { minDen: 2, maxDen: 10, maxNum: 9 });
      b = randomFraction(rng, { minDen: 2, maxDen: 10, maxNum: 9 });
    } else {
      a = randomFraction(rng, { minDen: 2, maxDen: 12, maxNum: 20, allowImproper: true });
      b = randomFraction(rng, { minDen: 2, maxDen: 12, maxNum: 20, allowImproper: true });
    }
    if (op === 'subtract' && a.num / a.den < b.num / b.den) [a, b] = [b, a];
    const result = op === 'add' ? addFractions(a, b) : subFractions(a, b);
    const symbol = op === 'add' ? '+' : '-';
    const formatFn = difficulty === 'hard' ? formatMixedNumber : formatFraction;
    const answerDisplay = formatFn(result);
    return {
      promptText: `${formatFn(a)} ${symbol} ${formatFn(b)} = ?`,
      answer: result,
      answerDisplay,
      checkAnswer: fractionCheckAnswer(result),
      meta: { generatorId: addSubtractUnlikeFractions.id, difficulty, a, b, op, answerDisplay },
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
      strategy: ['Find a common denominator for both fractions.', 'Rewrite each fraction using that common denominator.', `${op === 'add' ? 'Add' : 'Subtract'} the numerators, keeping the common denominator.`, 'Simplify the result if it can be reduced.'],
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

// --- Fraction as division (5.NF.B.3) --------------------------------------------

const SHARING_SCENARIOS = [
  { items: 'sandwiches', people: 'friends' },
  { items: 'pizzas', people: 'people' },
  { items: 'candy bars', people: 'kids' },
  { items: 'feet of ribbon', people: 'students' },
];

const fractionAsDivision = {
  id: 'grade5.fractionsOperations.fractionAsDivision',
  grade: GRADE,
  topic: TOPIC,
  label: 'Fractions as Division',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const people = randomInt(rng, 2, difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8);
    const items = randomInt(rng, 1, difficulty === 'easy' ? 8 : difficulty === 'medium' ? 12 : 16);
    const scenario = randomChoice(rng, SHARING_SCENARIOS);
    const fraction = reduceFraction(items, people);
    const answerDisplay = formatMixedNumber(fraction);
    return {
      promptText: `${items} ${scenario.items} are shared equally among ${people} ${scenario.people}. How much does each person get? (write as a fraction or mixed number)`,
      answer: fraction,
      answerDisplay,
      checkAnswer: fractionCheckAnswer(fraction),
      meta: { generatorId: fractionAsDivision.id, difficulty, items, people, answerDisplay },
    };
  },
  explain(meta) {
    const { items, people, answerDisplay } = meta;
    return {
      strategy: ['Sharing items equally among people is the same as dividing: items ÷ people.', 'Write the division as a fraction: items/people, then simplify.'],
      workedSteps: [`${items} ÷ ${people} = ${items}/${people}.`, `Simplified, that's ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Multiplying fractions (5.NF.B.4) -------------------------------------------

const multiplyFraction = {
  id: 'grade5.fractionsOperations.multiplyFraction',
  grade: GRADE,
  topic: TOPIC,
  label: 'Multiplying Fractions',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    if (difficulty !== 'hard') {
      const den = randomInt(rng, 2, difficulty === 'easy' ? 6 : 10);
      const num = randomInt(rng, 1, den - 1);
      const whole = randomInt(rng, 2, difficulty === 'easy' ? 12 : 20);
      const fraction = { num, den };
      const result = reduceFraction(num * whole, den);
      const answerDisplay = formatMixedNumber(result);
      return {
        promptText: `What is ${formatFraction(fraction)} of ${whole}?`,
        answer: result,
        answerDisplay,
        checkAnswer: fractionCheckAnswer(result),
        meta: { generatorId: multiplyFraction.id, difficulty, mode: 'ofWhole', fraction, whole, answerDisplay },
      };
    }
    const a = randomFraction(rng, { minDen: 2, maxDen: 10, maxNum: 9 });
    const b = randomFraction(rng, { minDen: 2, maxDen: 10, maxNum: 9 });
    const result = mulFractions(a, b);
    const answerDisplay = formatFraction(result);
    return {
      promptText: `${formatFraction(a)} × ${formatFraction(b)} = ?`,
      answer: result,
      answerDisplay,
      checkAnswer: fractionCheckAnswer(result),
      meta: { generatorId: multiplyFraction.id, difficulty, mode: 'fractionTimesFraction', a, b, answerDisplay },
    };
  },
  explain(meta) {
    const { mode, answerDisplay } = meta;
    if (mode === 'ofWhole') {
      const { fraction, whole } = meta;
      return {
        strategy: ['"Of" means multiply.', 'Multiply the whole number by the numerator, then divide by the denominator.'],
        workedSteps: [`${formatFraction(fraction)} × ${whole} = (${fraction.num} × ${whole}) / ${fraction.den} = ${fraction.num * whole}/${fraction.den}.`, `Simplified, that's ${answerDisplay}.`],
        finalAnswerDisplay: answerDisplay,
      };
    }
    const { a, b } = meta;
    return {
      strategy: ['Multiply the numerators together to get the new numerator.', 'Multiply the denominators together to get the new denominator.', 'Simplify the result if it can be reduced.'],
      workedSteps: [`Multiply the numerators: ${a.num} × ${b.num} = ${a.num * b.num}.`, `Multiply the denominators: ${a.den} × ${b.den} = ${a.den * b.den}.`, `That simplifies to ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Dividing with unit fractions (5.NF.B.7) ------------------------------------

const divideUnitFraction = {
  id: 'grade5.fractionsOperations.divideUnitFraction',
  grade: GRADE,
  topic: TOPIC,
  label: 'Dividing Unit Fractions',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const direction = randomChoice(rng, ['fractionByWhole', 'wholeByFraction']);
    const den = randomInt(rng, 2, difficulty === 'easy' ? 6 : difficulty === 'medium' ? 8 : 10);
    const whole = randomInt(rng, 2, difficulty === 'easy' ? 5 : 8);
    if (direction === 'fractionByWhole') {
      const result = reduceFraction(1, den * whole);
      const answerDisplay = formatFraction(result);
      return {
        promptText: `What is 1/${den} ÷ ${whole}?`,
        answer: result,
        answerDisplay,
        checkAnswer: fractionCheckAnswer(result),
        meta: { generatorId: divideUnitFraction.id, difficulty, direction, den, whole, answerDisplay },
      };
    }
    const answer = whole * den;
    const answerDisplay = `${answer}`;
    return {
      promptText: `What is ${whole} ÷ 1/${den}?`,
      answer,
      answerDisplay,
      checkAnswer: numericCheckAnswer(answer, 1e-9),
      meta: { generatorId: divideUnitFraction.id, difficulty, direction, den, whole, answerDisplay },
    };
  },
  explain(meta) {
    const { direction, den, whole, answerDisplay } = meta;
    if (direction === 'fractionByWhole') {
      return {
        strategy: ['Dividing a unit fraction by a whole number means splitting that small piece into even more, smaller pieces.', 'Multiply the denominator by the whole number.'],
        workedSteps: [`1/${den} ÷ ${whole} = 1/(${den} × ${whole}) = ${answerDisplay}.`],
        finalAnswerDisplay: answerDisplay,
      };
    }
    return {
      strategy: ['Dividing a whole number by a unit fraction means finding how many of those small pieces fit into the whole number.', 'Multiply the whole number by the denominator.'],
      workedSteps: [`${whole} ÷ 1/${den} = ${whole} × ${den} = ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

export const generators = [addSubtractUnlikeFractions, fractionAsDivision, multiplyFraction, divideUnitFraction];
