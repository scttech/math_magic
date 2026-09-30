import { randomInt, randomChoice } from '../../core/rng.js';
import { gcd, roundTo, numericCheckAnswer } from '../../core/problemGenerator.js';

const GRADE = '6';
const TOPIC = 'ratiosProportions';

function reducedRatioString(a, b) {
  const divisor = gcd(a, b);
  return `${a / divisor}:${b / divisor}`;
}

function ratioCheckAnswer(reducedA, reducedB) {
  return (userInput) => {
    if (typeof userInput !== 'string') return false;
    const match = /^\s*(\d+)\s*[:/]\s*(\d+)\s*$/.exec(userInput.trim());
    if (!match) return false;
    const num = Number(match[1]);
    const den = Number(match[2]);
    const divisor = gcd(num, den);
    return num / divisor === reducedA && den / divisor === reducedB;
  };
}

const simplifyRatio = {
  id: 'grade6.ratiosProportions.simplifyRatio',
  grade: GRADE,
  topic: TOPIC,
  label: 'Simplifying Ratios',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const factor = difficulty === 'easy' ? randomInt(rng, 2, 5) : difficulty === 'medium' ? randomInt(rng, 2, 9) : randomInt(rng, 2, 12);
    const maxBase = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 10 : 15;
    let baseA = randomInt(rng, 1, maxBase);
    let baseB = randomInt(rng, 1, maxBase);
    while (baseB === baseA && baseA === 1) baseB = randomInt(rng, 1, maxBase);
    const a = baseA * factor;
    const b = baseB * factor;
    const divisor = gcd(a, b);
    const reducedA = a / divisor;
    const reducedB = b / divisor;
    const answerDisplay = `${reducedA}:${reducedB}`;
    return {
      promptText: `Simplify the ratio ${a}:${b} to lowest terms.`,
      answer: answerDisplay,
      answerDisplay,
      checkAnswer: ratioCheckAnswer(reducedA, reducedB),
      meta: { generatorId: simplifyRatio.id, difficulty, a, b, answerDisplay },
    };
  },
  explain(meta) {
    const { a, b, answerDisplay } = meta;
    const divisor = gcd(a, b);
    return {
      strategy: ['Find the greatest common factor (GCF) of both numbers in the ratio.', 'Divide both numbers by the GCF.'],
      workedSteps: [
        `The greatest common factor of ${a} and ${b} is ${divisor}.`,
        `Divide both parts by ${divisor}: ${a} ÷ ${divisor} = ${a / divisor}, and ${b} ÷ ${divisor} = ${b / divisor}.`,
        `The simplified ratio is ${answerDisplay}.`,
      ],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

const solveProportion = {
  id: 'grade6.ratiosProportions.solveProportion',
  grade: GRADE,
  topic: TOPIC,
  label: 'Solving Proportions',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const maxBase = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 10 : 15;
    const maxScale = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 8 : 12;
    const a = randomInt(rng, 1, maxBase);
    const b = randomInt(rng, 1, maxBase);
    const scale = randomInt(rng, 2, maxScale);
    const c = a * scale;
    const missing = b * scale;
    // Hide the fourth term: a/b = c/x, solve for x (= missing).
    const answerDisplay = `${missing}`;
    return {
      promptText: `${a}/${b} = ${c}/x. What is x?`,
      answer: missing,
      answerDisplay,
      checkAnswer: numericCheckAnswer(missing, 1e-9),
      meta: { generatorId: solveProportion.id, difficulty, a, b, c, answerDisplay },
    };
  },
  explain(meta) {
    const { a, b, c, answerDisplay } = meta;
    const scale = c / a;
    return {
      strategy: [
        'Figure out what number the first fraction was multiplied by to get the second numerator.',
        'Multiply the first denominator by that same number to find the missing value.',
      ],
      workedSteps: [
        `${a} was multiplied by ${c} ÷ ${a} = ${scale} to get ${c}.`,
        `Multiply ${b} by that same number: ${b} × ${scale} = ${answerDisplay}.`,
      ],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

const UNIT_RATE_SCENARIOS = [
  { unit: 'cups of flour', per: 'cookies', verb: 'A recipe uses' },
  { unit: 'dollars', per: 'tickets', verb: 'A stand charges' },
  { unit: 'miles', per: 'hours', verb: 'A car travels' },
  { unit: 'pages', per: 'minutes', verb: 'A student reads' },
  { unit: 'gallons of paint', per: 'walls', verb: 'A painter uses' },
];

const unitRateWordProblem = {
  id: 'grade6.ratiosProportions.unitRateWordProblem',
  grade: GRADE,
  topic: TOPIC,
  label: 'Unit Rate Word Problems',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const scenario = randomChoice(rng, UNIT_RATE_SCENARIOS);
    const maxA = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 9 : 15;
    const maxB = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 10;
    const maxScale = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 6 : 10;
    // Keep `a` at least 2 so the plural unit noun ("pages", "cups of flour", ...) always reads correctly.
    const a = randomInt(rng, 2, maxA);
    const b = randomInt(rng, 2, maxB);
    const scale = randomInt(rng, 2, maxScale);
    const targetPer = b * scale;
    const answer = a * scale;
    const answerDisplay = `${answer}`;
    return {
      promptText: `${scenario.verb} ${a} ${scenario.unit} for every ${b} ${scenario.per}. How many ${scenario.unit} are needed for ${targetPer} ${scenario.per}?`,
      answer,
      answerDisplay,
      checkAnswer: numericCheckAnswer(answer, 1e-9),
      meta: { generatorId: unitRateWordProblem.id, difficulty, scenario, a, b, scale, targetPer, answerDisplay },
    };
  },
  explain(meta) {
    const { scenario, a, b, scale, targetPer, answerDisplay } = meta;
    return {
      strategy: [
        `Figure out how many groups of ${b} ${scenario.per} fit into ${targetPer} ${scenario.per}.`,
        `Multiply the original ${scenario.unit} amount by that same scale factor.`,
      ],
      workedSteps: [
        `${targetPer} ${scenario.per} is ${scale} times as many as ${b} ${scenario.per} (${b} × ${scale} = ${targetPer}).`,
        `Multiply the ${scenario.unit} amount by ${scale} too: ${a} × ${scale} = ${answerDisplay}.`,
      ],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Equivalent ratio tables -------------------------------------------------

/** Three distinct scale factors including 1, sorted ascending, so the rows form a real "table" of equivalent ratios. */
function threeDistinctScales(rng, maxScale) {
  const set = new Set([1]);
  while (set.size < 3) set.add(randomInt(rng, 2, maxScale));
  return Array.from(set).sort((x, y) => x - y);
}

const equivalentRatioTable = {
  id: 'grade6.ratiosProportions.equivalentRatioTable',
  grade: GRADE,
  topic: TOPIC,
  label: 'Equivalent Ratio Tables',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const maxBase = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 10 : 15;
    const maxScale = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 12;
    const a = randomInt(rng, 1, maxBase);
    const b = randomInt(rng, 1, maxBase);
    const scales = threeDistinctScales(rng, maxScale);
    const rows = scales.map((s) => [a * s, b * s]);
    const missingRowIndex = randomInt(rng, 0, rows.length - 1);
    const missingSide = randomChoice(rng, ['first', 'second']);
    const missingValue = rows[missingRowIndex][missingSide === 'first' ? 0 : 1];

    const rowsText = rows
      .map((row, i) => (i === missingRowIndex ? (missingSide === 'first' ? `?:${row[1]}` : `${row[0]}:?`) : `${row[0]}:${row[1]}`))
      .join(', ');
    const answerDisplay = `${missingValue}`;
    return {
      promptText: `These ratios are all equivalent: ${rowsText}. What is the missing value?`,
      answer: missingValue,
      answerDisplay,
      checkAnswer: numericCheckAnswer(missingValue, 1e-9),
      meta: { generatorId: equivalentRatioTable.id, difficulty, a, b, rows, missingRowIndex, missingSide, answerDisplay },
    };
  },
  explain(meta) {
    const { a, b, rows, missingRowIndex, missingSide, answerDisplay } = meta;
    const missingRow = rows[missingRowIndex];
    const knownValue = missingSide === 'first' ? missingRow[1] : missingRow[0];
    const baseValue = missingSide === 'first' ? b : a;
    const scaleFactor = knownValue / baseValue;
    return {
      strategy: [
        'Find the base ratio from a row where both values are known.',
        'Figure out the scale factor between the base ratio and the row with the missing value.',
        'Multiply the other base value by that same scale factor.',
      ],
      workedSteps: [
        `The base ratio is ${a}:${b}.`,
        `In the row with the missing value, the known number ${knownValue} is ${baseValue} × ${scaleFactor} = ${knownValue}, so the scale factor is ${scaleFactor}.`,
        `Multiply the other base value by ${scaleFactor} too, giving ${answerDisplay}.`,
      ],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Percent problems ---------------------------------------------------------

const PERCENT_POOL_BY_DIFFICULTY = {
  easy: [10, 20, 25, 50, 75],
  medium: [5, 10, 15, 20, 25, 40, 50, 60, 75, 80],
  hard: [5, 8, 12, 15, 24, 35, 45, 65, 85, 95],
};

/** A "whole" that's a clean multiple of the percent's reduced denominator, so percent% of it is always a whole number. */
function randomNiceWholeForPercent(rng, percent, maxMultiplier) {
  const reducedDen = 100 / gcd(percent, 100);
  return reducedDen * randomInt(rng, 2, maxMultiplier);
}

const percentProblems = {
  id: 'grade6.ratiosProportions.percentProblems',
  grade: GRADE,
  topic: TOPIC,
  label: 'Percent Problems',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const percentPool = PERCENT_POOL_BY_DIFFICULTY[difficulty] || PERCENT_POOL_BY_DIFFICULTY.medium;
    const maxMultiplier = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20;
    const direction = randomChoice(rng, ['findPart', 'findWhole', 'findPercent']);
    const percent = randomChoice(rng, percentPool);
    const whole = randomNiceWholeForPercent(rng, percent, maxMultiplier);
    const part = Math.round((whole * percent) / 100);
    const baseMeta = { generatorId: percentProblems.id, difficulty, direction, percent, whole, part };

    if (direction === 'findPart') {
      const answerDisplay = `${part}`;
      return {
        promptText: `What is ${percent}% of ${whole}?`,
        answer: part,
        answerDisplay,
        checkAnswer: numericCheckAnswer(part, 1e-6),
        meta: { ...baseMeta, answerDisplay },
      };
    }
    if (direction === 'findWhole') {
      const answerDisplay = `${whole}`;
      return {
        promptText: `${part} is ${percent}% of what number?`,
        answer: whole,
        answerDisplay,
        checkAnswer: numericCheckAnswer(whole, 1e-6),
        meta: { ...baseMeta, answerDisplay },
      };
    }
    const answerDisplay = `${percent}%`;
    return {
      promptText: `${part} is what percent of ${whole}?`,
      answer: percent,
      answerDisplay,
      checkAnswer: numericCheckAnswer(percent, 1e-6),
      meta: { ...baseMeta, answerDisplay },
    };
  },
  explain(meta) {
    const { direction, percent, whole, part, answerDisplay } = meta;
    const percentAsDecimal = roundTo(percent / 100, 4);
    if (direction === 'findPart') {
      return {
        strategy: ['Write the percent as a decimal.', 'Multiply it by the whole number.'],
        workedSteps: [`${percent}% = ${percentAsDecimal}.`, `Multiply: ${percentAsDecimal} × ${whole} = ${answerDisplay}.`],
        finalAnswerDisplay: answerDisplay,
      };
    }
    if (direction === 'findWhole') {
      return {
        strategy: ['Write the percent as a decimal.', 'Divide the known part by that decimal to find the whole.'],
        workedSteps: [`${percent}% = ${percentAsDecimal}.`, `Divide: ${part} ÷ ${percentAsDecimal} = ${answerDisplay}.`],
        finalAnswerDisplay: answerDisplay,
      };
    }
    return {
      strategy: ['Divide the part by the whole.', 'Multiply by 100 to convert to a percent.'],
      workedSteps: [`Divide: ${part} ÷ ${whole} = ${roundTo(part / whole, 4)}.`, `Multiply by 100: ${roundTo(part / whole, 4)} × 100 = ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Unit conversion via ratio reasoning --------------------------------------

const CONVERSIONS = [
  { from: 'feet', fromSingular: 'foot', to: 'inches', factor: 12 },
  { from: 'yards', fromSingular: 'yard', to: 'feet', factor: 3 },
  { from: 'pounds', fromSingular: 'pound', to: 'ounces', factor: 16 },
  { from: 'hours', fromSingular: 'hour', to: 'minutes', factor: 60 },
  { from: 'minutes', fromSingular: 'minute', to: 'seconds', factor: 60 },
  { from: 'gallons', fromSingular: 'gallon', to: 'quarts', factor: 4 },
  { from: 'quarts', fromSingular: 'quart', to: 'pints', factor: 2 },
  { from: 'days', fromSingular: 'day', to: 'hours', factor: 24 },
  { from: 'weeks', fromSingular: 'week', to: 'days', factor: 7 },
  { from: 'meters', fromSingular: 'meter', to: 'centimeters', factor: 100 },
  { from: 'kilometers', fromSingular: 'kilometer', to: 'meters', factor: 1000 },
  { from: 'kilograms', fromSingular: 'kilogram', to: 'grams', factor: 1000 },
  { from: 'liters', fromSingular: 'liter', to: 'milliliters', factor: 1000 },
];

const unitConversion = {
  id: 'grade6.ratiosProportions.unitConversion',
  grade: GRADE,
  topic: TOPIC,
  label: 'Converting Units with Ratios',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const conversion = randomChoice(rng, CONVERSIONS);
    const maxMultiplier = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 50;
    const op = randomChoice(rng, ['multiply', 'divide']);

    let amount;
    let answer;
    let promptFromLabel;
    let promptToLabel;
    if (op === 'multiply') {
      // e.g. "3 feet = ? inches" — going from the bigger unit to the smaller unit multiplies.
      amount = randomInt(rng, 2, maxMultiplier);
      answer = amount * conversion.factor;
      promptFromLabel = conversion.from;
      promptToLabel = conversion.to;
    } else {
      // e.g. "36 inches = ? feet" — going from the smaller unit to the bigger unit divides.
      answer = randomInt(rng, 2, maxMultiplier);
      amount = answer * conversion.factor;
      promptFromLabel = conversion.to;
      promptToLabel = conversion.from;
    }
    const answerDisplay = `${answer}`;
    return {
      promptText: `Convert: ${amount} ${promptFromLabel} = ? ${promptToLabel}`,
      answer,
      answerDisplay,
      checkAnswer: numericCheckAnswer(answer, 1e-6),
      meta: {
        generatorId: unitConversion.id,
        difficulty,
        op,
        amount,
        factor: conversion.factor,
        baseFromSingular: conversion.fromSingular,
        baseTo: conversion.to,
        answerDisplay,
      },
    };
  },
  explain(meta) {
    const { op, amount, factor, baseFromSingular, baseTo, answerDisplay } = meta;
    const relationship = `Each ${baseFromSingular} equals ${factor} ${baseTo}.`;
    if (op === 'multiply') {
      return {
        strategy: [relationship, 'Multiply the given amount by the conversion factor.'],
        workedSteps: [`Multiply: ${amount} × ${factor} = ${answerDisplay}.`],
        finalAnswerDisplay: answerDisplay,
      };
    }
    return {
      strategy: [relationship, 'Divide the given amount by the conversion factor.'],
      workedSteps: [`Divide: ${amount} ÷ ${factor} = ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

export const generators = [simplifyRatio, solveProportion, unitRateWordProblem, equivalentRatioTable, percentProblems, unitConversion];
