// 5.NBT.A: place value, powers of 10, and decimals to thousandths.
import { randomInt, randomChoice } from '../../core/rng.js';
import { roundTo, numericCheckAnswer } from '../../core/problemGenerator.js';

const GRADE = '5';
const TOPIC = 'placeValueDecimals';

// --- Multiplying & dividing by powers of 10 (5.NBT.A.2) -----------------------

const SUPERSCRIPTS = { 1: '¹', 2: '²', 3: '³' };

function formatPowerOfTen(exponent) {
  return `10${SUPERSCRIPTS[exponent] || `^${exponent}`}`;
}

const multiplyDivideByPowerOfTen = {
  id: 'grade5.placeValueDecimals.multiplyDivideByPowerOfTen',
  grade: GRADE,
  topic: TOPIC,
  label: 'Multiplying & Dividing by Powers of 10',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const op = randomChoice(rng, ['multiply', 'divide']);
    const exponent = difficulty === 'easy' ? randomChoice(rng, [1, 2]) : randomChoice(rng, [1, 2, 3]);
    const decimalPlaces = difficulty === 'hard' ? 2 : 1;
    const scale = 10 ** decimalPlaces;
    const maxWhole = difficulty === 'hard' ? 80 : 40;
    const base = randomInt(rng, 1, maxWhole * scale) / scale;
    const factor = 10 ** exponent;
    const result = roundTo(op === 'multiply' ? base * factor : base / factor, 6);
    const answerDisplay = `${result}`;
    const powerDisplay = formatPowerOfTen(exponent);
    const symbol = op === 'multiply' ? '×' : '÷';
    return {
      promptText: `${base} ${symbol} ${powerDisplay} = ?`,
      answer: result,
      answerDisplay,
      checkAnswer: numericCheckAnswer(result, 1e-6),
      meta: { generatorId: multiplyDivideByPowerOfTen.id, difficulty, op, base, exponent, answerDisplay },
    };
  },
  explain(meta) {
    const { op, base, exponent, answerDisplay } = meta;
    const direction = op === 'multiply' ? 'right' : 'left';
    const powerDisplay = formatPowerOfTen(exponent);
    return {
      strategy: [`Multiplying by ${powerDisplay} moves the decimal point ${exponent} place(s) to the right. Dividing by ${powerDisplay} moves it ${exponent} place(s) to the left.`],
      workedSteps: [`${op === 'multiply' ? 'Multiplying' : 'Dividing'} by ${powerDisplay} moves the decimal point ${exponent} place(s) ${direction}.`, `${base} becomes ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Identifying the digit in a given place (5.NBT.A.1) -----------------------

const INT_PLACE_NAMES = ['ones', 'tens', 'hundreds', 'thousands'];
const DEC_PLACE_NAMES = ['tenths', 'hundredths', 'thousandths'];

function buildPlaceValueNumber(rng, difficulty) {
  const intDigits = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;
  const decDigits = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
  let intPart = String(randomInt(rng, 1, 9));
  for (let i = 1; i < intDigits; i++) intPart += String(randomInt(rng, 0, 9));
  let decPart = '';
  for (let i = 0; i < decDigits; i++) decPart += String(randomInt(rng, 0, 9));
  return { intPart, decPart, display: `${intPart}.${decPart}` };
}

const placeValueOfDigit = {
  id: 'grade5.placeValueDecimals.placeValueOfDigit',
  grade: GRADE,
  topic: TOPIC,
  label: 'Place Value of a Digit',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const { intPart, decPart, display } = buildPlaceValueNumber(rng, difficulty);
    const positions = [];
    for (let i = 0; i < intPart.length; i++) positions.push({ name: INT_PLACE_NAMES[intPart.length - 1 - i], digit: intPart[i] });
    for (let i = 0; i < decPart.length; i++) positions.push({ name: DEC_PLACE_NAMES[i], digit: decPart[i] });
    const chosen = randomChoice(rng, positions);
    const answerDisplay = chosen.digit;
    return {
      promptText: `In the number ${display}, what digit is in the ${chosen.name} place?`,
      answer: Number(chosen.digit),
      answerDisplay,
      checkAnswer: numericCheckAnswer(Number(chosen.digit), 1e-9),
      meta: { generatorId: placeValueOfDigit.id, difficulty, display, placeName: chosen.name, answerDisplay },
    };
  },
  explain(meta) {
    const { display, placeName, answerDisplay } = meta;
    return {
      strategy: ['Each position in a number has a place value name. Moving left from the decimal point: ones, tens, hundreds. Moving right: tenths, hundredths, thousandths.'],
      workedSteps: [`In ${display}, the ${placeName} place holds the digit ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Comparing decimals (5.NBT.A.3b) -------------------------------------------

const compareDecimals = {
  id: 'grade5.placeValueDecimals.compareDecimals',
  grade: GRADE,
  topic: TOPIC,
  label: 'Comparing Decimals',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const decimalPlaces = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
    const scale = 10 ** decimalPlaces;
    const maxWhole = difficulty === 'easy' ? 9 : difficulty === 'medium' ? 20 : 50;
    const a = randomInt(rng, 0, maxWhole * scale) / scale;
    const b = randomInt(rng, 0, maxWhole * scale) / scale;
    const symbol = a < b ? '<' : a > b ? '>' : '=';
    const answerDisplay = symbol;
    return {
      promptText: `Compare: ${a.toFixed(decimalPlaces)} ___ ${b.toFixed(decimalPlaces)} (use <, >, or =)`,
      answer: symbol,
      answerDisplay,
      checkAnswer: (userInput) => typeof userInput === 'string' && userInput.trim() === symbol,
      meta: { generatorId: compareDecimals.id, difficulty, a, b, decimalPlaces, answerDisplay },
    };
  },
  explain(meta) {
    const { a, b, decimalPlaces, answerDisplay } = meta;
    return {
      strategy: ['Line up the decimal points, then compare digits from left to right — the whole-number part first, then tenths, then hundredths, and so on.'],
      workedSteps: [`Compare ${a.toFixed(decimalPlaces)} and ${b.toFixed(decimalPlaces)} place by place.`, `${a.toFixed(decimalPlaces)} ${answerDisplay} ${b.toFixed(decimalPlaces)}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Rounding decimals (5.NBT.A.4) ---------------------------------------------

const ROUND_TARGETS = [
  { name: 'whole number', decimals: 0 },
  { name: 'tenth', decimals: 1 },
  { name: 'hundredth', decimals: 2 },
];

const roundDecimals = {
  id: 'grade5.placeValueDecimals.roundDecimals',
  grade: GRADE,
  topic: TOPIC,
  label: 'Rounding Decimals',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const decimalPlaces = difficulty === 'easy' ? 2 : 3;
    const scale = 10 ** decimalPlaces;
    const maxWhole = difficulty === 'hard' ? 50 : 20;
    const value = randomInt(rng, 1, maxWhole * scale) / scale;
    const target = difficulty === 'easy' ? randomChoice(rng, ROUND_TARGETS.slice(0, 2)) : randomChoice(rng, ROUND_TARGETS);
    const result = roundTo(value, target.decimals);
    const answerDisplay = result.toFixed(target.decimals);
    return {
      promptText: `Round ${value.toFixed(decimalPlaces)} to the nearest ${target.name}.`,
      answer: result,
      answerDisplay,
      checkAnswer: numericCheckAnswer(result, 1e-9),
      meta: { generatorId: roundDecimals.id, difficulty, value, decimalPlaces, roundName: target.name, answerDisplay },
    };
  },
  explain(meta) {
    const { value, decimalPlaces, roundName, answerDisplay } = meta;
    return {
      strategy: [`Look at the digit just to the right of the ${roundName} place.`, 'If it is 5 or more, round up. If it is less than 5, keep the digit the same.'],
      workedSteps: [`${value.toFixed(decimalPlaces)} rounded to the nearest ${roundName} is ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

export const generators = [multiplyDivideByPowerOfTen, placeValueOfDigit, compareDecimals, roundDecimals];
