// 5.NBT.B: fluency with multi-digit whole number multiplication/division, and
// decimal operations to the hundredths place.
import { randomInt, randomChoice } from '../../core/rng.js';
import { roundTo, numericCheckAnswer } from '../../core/problemGenerator.js';

const GRADE = '5';
const TOPIC = 'multiDigitArithmetic';

// --- Multiplying multi-digit whole numbers (5.NBT.B.5) -------------------------

const multiplyMultiDigit = {
  id: 'grade5.multiDigitArithmetic.multiplyMultiDigit',
  grade: GRADE,
  topic: TOPIC,
  label: 'Multiplying Multi-Digit Numbers',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const aDigits = difficulty === 'easy' ? 2 : 3;
    const bDigits = difficulty === 'hard' ? 3 : 2;
    const a = randomInt(rng, 10 ** (aDigits - 1), 10 ** aDigits - 1);
    const b = randomInt(rng, 10 ** (bDigits - 1), 10 ** bDigits - 1);
    const answer = a * b;
    const answerDisplay = `${answer}`;
    return {
      promptText: `${a} × ${b} = ?`,
      answer,
      answerDisplay,
      checkAnswer: numericCheckAnswer(answer, 1e-9),
      meta: { generatorId: multiplyMultiDigit.id, difficulty, a, b, answerDisplay },
    };
  },
  explain(meta) {
    const { a, b, answerDisplay } = meta;
    return {
      strategy: ['Multiply using the standard algorithm: multiply by each digit of the second number, then add the partial products together.'],
      workedSteps: [`${a} × ${b} = ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Dividing multi-digit whole numbers (5.NBT.B.6) -----------------------------

function longDivisionCheckAnswer(quotient, remainder) {
  return (userInput) => {
    if (typeof userInput !== 'string' && typeof userInput !== 'number') return false;
    const cleaned = String(userInput).trim().toLowerCase().replace(/\s+/g, ' ');
    if (remainder === 0) {
      const parsed = parseFloat(cleaned);
      return !Number.isNaN(parsed) && parsed === quotient;
    }
    const match = /^(-?\d+)\s*r(?:emainder)?\s*(\d+)$/.exec(cleaned);
    if (!match) return false;
    return Number(match[1]) === quotient && Number(match[2]) === remainder;
  };
}

const divideMultiDigit = {
  id: 'grade5.multiDigitArithmetic.divideMultiDigit',
  grade: GRADE,
  topic: TOPIC,
  label: 'Dividing Multi-Digit Numbers',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const divisor = difficulty === 'easy' ? randomInt(rng, 2, 9) : difficulty === 'medium' ? randomInt(rng, 10, 50) : randomInt(rng, 11, 99);
    const quotient = difficulty === 'easy' ? randomInt(rng, 10, 99) : difficulty === 'medium' ? randomInt(rng, 20, 150) : randomInt(rng, 20, 99);
    const remainder = difficulty === 'hard' ? randomInt(rng, 0, divisor - 1) : 0;
    const dividend = divisor * quotient + remainder;
    const answerDisplay = remainder === 0 ? `${quotient}` : `${quotient} R ${remainder}`;
    const hint = remainder === 0 ? '' : ' If there is a remainder, write it like "23 R 4".';
    return {
      promptText: `What is ${dividend} ÷ ${divisor}?${hint}`,
      answer: { quotient, remainder },
      answerDisplay,
      checkAnswer: longDivisionCheckAnswer(quotient, remainder),
      meta: { generatorId: divideMultiDigit.id, difficulty, dividend, divisor, quotient, remainder, answerDisplay },
    };
  },
  explain(meta) {
    const { dividend, divisor, quotient, remainder, answerDisplay } = meta;
    const product = divisor * quotient;
    const steps = [
      `Divide: how many times does ${divisor} go into ${dividend}? ${quotient} times.`,
      `Multiply: ${divisor} × ${quotient} = ${product}.`,
      `Subtract: ${dividend} − ${product} = ${remainder}.`,
    ];
    steps.push(remainder === 0 ? `${divisor} divides evenly, so the answer is ${answerDisplay}.` : `${remainder} is less than the divisor, so that's the remainder: ${answerDisplay}.`);
    return {
      strategy: ['Use the standard long division algorithm: divide, multiply, subtract, and check what is left over.'],
      workedSteps: steps,
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Adding & subtracting decimals to hundredths (5.NBT.B.7) -------------------

const addSubtractDecimals = {
  id: 'grade5.multiDigitArithmetic.addSubtractDecimals',
  grade: GRADE,
  topic: TOPIC,
  label: 'Adding & Subtracting Decimals',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const maxWhole = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 50 : 100;
    const scale = 100;
    let a = randomInt(rng, 0, maxWhole * scale) / scale;
    let b = randomInt(rng, 0, maxWhole * scale) / scale;
    const op = randomChoice(rng, ['add', 'subtract']);
    if (op === 'subtract' && a < b) [a, b] = [b, a];
    const result = roundTo(op === 'add' ? a + b : a - b, 2);
    const symbol = op === 'add' ? '+' : '-';
    const answerDisplay = result.toFixed(2);
    return {
      promptText: `${a.toFixed(2)} ${symbol} ${b.toFixed(2)} = ?`,
      answer: result,
      answerDisplay,
      checkAnswer: numericCheckAnswer(result, 0.005),
      meta: { generatorId: addSubtractDecimals.id, difficulty, a, b, op, answerDisplay },
    };
  },
  explain(meta) {
    const { a, b, op, answerDisplay } = meta;
    const symbol = op === 'add' ? '+' : '−';
    return {
      strategy: ['Line up the decimal points.', `${op === 'add' ? 'Add' : 'Subtract'} the numbers just like whole numbers, column by column.`, 'Bring the decimal point straight down into the answer.'],
      workedSteps: [`Line up the decimal points: ${a.toFixed(2)} and ${b.toFixed(2)}.`, `${op === 'add' ? 'Add' : 'Subtract'}: ${a.toFixed(2)} ${symbol} ${b.toFixed(2)} = ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Multiplying & dividing decimals to hundredths (5.NBT.B.7) -----------------

const multiplyDivideDecimals = {
  id: 'grade5.multiDigitArithmetic.multiplyDivideDecimals',
  grade: GRADE,
  topic: TOPIC,
  label: 'Multiplying & Dividing Decimals',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const op = randomChoice(rng, ['multiply', 'divide']);
    if (op === 'multiply') {
      const decimalPlaces = difficulty === 'easy' ? 1 : 2;
      const scale = 10 ** decimalPlaces;
      const a = randomInt(rng, 1, (difficulty === 'hard' ? 30 : 15) * scale) / scale;
      const useDecimalFactor = difficulty === 'hard' && randomChoice(rng, [true, false]);
      const b = useDecimalFactor ? randomInt(rng, 2, 9) / 10 : randomInt(rng, 2, difficulty === 'hard' ? 12 : 9);
      const result = roundTo(a * b, 3);
      const answerDisplay = `${result}`;
      return {
        promptText: `${a} × ${b} = ?`,
        answer: result,
        answerDisplay,
        checkAnswer: numericCheckAnswer(result, 1e-6),
        meta: { generatorId: multiplyDivideDecimals.id, difficulty, op: 'multiply', a, b, answerDisplay },
      };
    }
    const divisor = difficulty === 'easy' ? randomInt(rng, 2, 9) : randomInt(rng, 2, 12);
    const decimalPlaces = difficulty === 'easy' ? 1 : 2;
    const quotient = randomInt(rng, 1, 20 * 10 ** decimalPlaces) / 10 ** decimalPlaces;
    const dividend = roundTo(divisor * quotient, 4);
    const result = roundTo(quotient, decimalPlaces);
    const answerDisplay = `${result}`;
    return {
      promptText: `${dividend} ÷ ${divisor} = ?`,
      answer: result,
      answerDisplay,
      checkAnswer: numericCheckAnswer(result, 1e-6),
      meta: { generatorId: multiplyDivideDecimals.id, difficulty, op: 'divide', dividend, divisor, answerDisplay },
    };
  },
  explain(meta) {
    const { op, answerDisplay } = meta;
    if (op === 'multiply') {
      const { a, b } = meta;
      return {
        strategy: ['Multiply the numbers as if there were no decimal points.', 'Count the total number of decimal places in both factors.', 'Place the decimal point that many places from the right in the answer.'],
        workedSteps: [`Multiply: ${a} × ${b} = ${answerDisplay}.`],
        finalAnswerDisplay: answerDisplay,
      };
    }
    const { dividend, divisor } = meta;
    return {
      strategy: ['Divide as usual, keeping the decimal point lined up with the one in the dividend.'],
      workedSteps: [`Divide: ${dividend} ÷ ${divisor} = ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

export const generators = [multiplyMultiDigit, divideMultiDigit, addSubtractDecimals, multiplyDivideDecimals];
