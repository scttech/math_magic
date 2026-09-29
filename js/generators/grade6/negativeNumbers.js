import { randomInt, randomChoice } from '../../core/rng.js';
import { numericCheckAnswer } from '../../core/problemGenerator.js';

const GRADE = '6';
const TOPIC = 'negativeNumbers';

function randomNonZeroInt(rng, min, max) {
  let value = 0;
  while (value === 0) value = randomInt(rng, min, max);
  return value;
}

const compareIntegers = {
  id: 'grade6.negativeNumbers.compareIntegers',
  grade: GRADE,
  topic: TOPIC,
  label: 'Comparing Integers',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const range = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 25 : 60;
    const a = randomInt(rng, -range, range);
    const b = randomInt(rng, -range, range);
    const symbol = a < b ? '<' : a > b ? '>' : '=';
    return {
      promptText: `Compare: ${a} ___ ${b} (use <, >, or =)`,
      answer: symbol,
      answerDisplay: symbol,
      checkAnswer: (userInput) => typeof userInput === 'string' && userInput.trim() === symbol,
      meta: { generatorId: compareIntegers.id, difficulty, a, b, answerDisplay: symbol },
    };
  },
  explain(meta) {
    const { a, b, answerDisplay } = meta;
    return {
      strategy: [
        'On a number line, numbers get larger moving right and smaller moving left.',
        'A negative number is always less than a positive number, and a more-negative number is less than a less-negative one.',
      ],
      workedSteps: [`Compare ${a} and ${b} on a number line.`, `${a} ${answerDisplay} ${b}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

const absoluteValue = {
  id: 'grade6.negativeNumbers.absoluteValue',
  grade: GRADE,
  topic: TOPIC,
  label: 'Absolute Value',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const range = difficulty === 'easy' ? 12 : difficulty === 'medium' ? 30 : 75;
    const value = randomNonZeroInt(rng, -range, range);
    const answer = Math.abs(value);
    const answerDisplay = `${answer}`;
    return {
      promptText: `What is |${value}|?`,
      answer,
      answerDisplay,
      checkAnswer: numericCheckAnswer(answer, 1e-9),
      meta: { generatorId: absoluteValue.id, difficulty, value, answerDisplay },
    };
  },
  explain(meta) {
    const { value, answerDisplay } = meta;
    return {
      strategy: ['Absolute value is the distance a number is from 0 on the number line.', 'Distance is never negative, so the absolute value is always positive (or 0).'],
      workedSteps: [`${value} is ${answerDisplay} away from 0, so |${value}| = ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

const addSubtractIntegers = {
  id: 'grade6.negativeNumbers.addSubtractIntegers',
  grade: GRADE,
  topic: TOPIC,
  label: 'Adding & Subtracting Integers',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const range = difficulty === 'easy' ? 12 : difficulty === 'medium' ? 30 : 60;
    const a = randomInt(rng, -range, range);
    const b = randomInt(rng, -range, range);
    const op = randomChoice(rng, ['add', 'subtract']);
    const answer = op === 'add' ? a + b : a - b;
    const symbol = op === 'add' ? '+' : '-';
    const bDisplay = b < 0 ? `(${b})` : `${b}`;
    const answerDisplay = `${answer}`;
    return {
      promptText: `${a} ${symbol} ${bDisplay} = ?`,
      answer,
      answerDisplay,
      checkAnswer: numericCheckAnswer(answer, 1e-9),
      meta: { generatorId: addSubtractIntegers.id, difficulty, a, b, op, answerDisplay },
    };
  },
  explain(meta) {
    const { a, b, op, answerDisplay } = meta;
    if (op === 'add') {
      return {
        strategy: [
          'If the signs are the same, add the numbers and keep the sign.',
          'If the signs are different, subtract the smaller absolute value from the larger, and keep the sign of the number with the larger absolute value.',
        ],
        workedSteps: [`${a} + ${b} = ${answerDisplay}.`],
        finalAnswerDisplay: answerDisplay,
      };
    }
    return {
      strategy: ['Subtracting a number is the same as adding its opposite.', 'Rewrite the subtraction as addition, then use the addition rule for integers.'],
      workedSteps: [`Subtracting ${b} is the same as adding ${-b}: ${a} + (${-b}) = ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

const multiplyDivideIntegers = {
  id: 'grade6.negativeNumbers.multiplyDivideIntegers',
  grade: GRADE,
  topic: TOPIC,
  label: 'Multiplying & Dividing Integers',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const maxFactor = difficulty === 'easy' ? 9 : difficulty === 'medium' ? 12 : 15;
    const op = randomChoice(rng, ['multiply', 'divide']);
    const aSign = randomChoice(rng, [1, -1]);
    const bSign = randomChoice(rng, [1, -1]);
    if (op === 'multiply') {
      const a = randomInt(rng, 1, maxFactor) * aSign;
      const b = randomInt(rng, 1, maxFactor) * bSign;
      const answer = a * b;
      const answerDisplay = `${answer}`;
      return {
        promptText: `${a} × ${b} = ?`,
        answer,
        answerDisplay,
        checkAnswer: numericCheckAnswer(answer, 1e-9),
        meta: { generatorId: multiplyDivideIntegers.id, difficulty, op: 'multiply', a, b, answerDisplay },
      };
    }
    const divisor = randomInt(rng, 1, maxFactor) * bSign;
    const quotient = randomInt(rng, 1, maxFactor) * aSign;
    const dividend = divisor * quotient;
    const answerDisplay = `${quotient}`;
    return {
      promptText: `${dividend} ÷ ${divisor} = ?`,
      answer: quotient,
      answerDisplay,
      checkAnswer: numericCheckAnswer(quotient, 1e-9),
      meta: { generatorId: multiplyDivideIntegers.id, difficulty, op: 'divide', dividend, divisor, answerDisplay },
    };
  },
  explain(meta) {
    const { op, answerDisplay } = meta;
    const signRule = 'Same signs give a positive answer; different signs give a negative answer.';
    if (op === 'multiply') {
      const { a, b } = meta;
      return {
        strategy: ['Multiply the two numbers as if they were both positive.', signRule],
        workedSteps: [`${a} × ${b} = ${answerDisplay}.`],
        finalAnswerDisplay: answerDisplay,
      };
    }
    const { dividend, divisor } = meta;
    return {
      strategy: ['Divide the two numbers as if they were both positive.', signRule],
      workedSteps: [`${dividend} ÷ ${divisor} = ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

const NUMBER_LINE_SCENARIOS = [
  { subject: 'The temperature was', unit: '°F', changeVerb: (delta) => (delta >= 0 ? 'rose' : 'dropped') },
  { subject: "A submarine's depth was", unit: ' feet', changeVerb: (delta) => (delta >= 0 ? 'rose by' : 'dove deeper by') },
  { subject: 'A hiker\'s elevation was', unit: ' feet', changeVerb: (delta) => (delta >= 0 ? 'climbed' : 'descended') },
  { subject: 'A bank account balance was', unit: ' dollars', changeVerb: (delta) => (delta >= 0 ? 'increased by' : 'decreased by') },
];

const numberLineWordProblem = {
  id: 'grade6.negativeNumbers.numberLineWordProblem',
  grade: GRADE,
  topic: TOPIC,
  label: 'Number Line Word Problems',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const startRange = difficulty === 'easy' ? 15 : difficulty === 'medium' ? 40 : 100;
    const changeRange = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 25 : 60;
    const scenario = randomChoice(rng, NUMBER_LINE_SCENARIOS);
    const start = randomInt(rng, -startRange, startRange);
    const delta = randomNonZeroInt(rng, -changeRange, changeRange);
    const answer = start + delta;
    const magnitude = Math.abs(delta);
    const answerDisplay = `${answer}`;
    return {
      promptText: `${scenario.subject} ${start}${scenario.unit}. It ${scenario.changeVerb(delta)} ${magnitude}${scenario.unit}. What is the new value?`,
      answer,
      answerDisplay,
      checkAnswer: numericCheckAnswer(answer, 1e-9),
      // scenario.changeVerb is a function, so it can't survive JSON — stash the already-resolved verb text instead.
      meta: { generatorId: numberLineWordProblem.id, difficulty, unit: scenario.unit, verbText: scenario.changeVerb(delta), start, delta, answerDisplay },
    };
  },
  explain(meta) {
    const { unit, verbText, start, delta, answerDisplay } = meta;
    return {
      strategy: [
        'A change described as an increase means add; a change described as a decrease means subtract.',
        'Apply that change to the starting value.',
      ],
      workedSteps: [
        `Start at ${start}${unit}.`,
        `It ${verbText} ${Math.abs(delta)}${unit}, which means ${delta >= 0 ? 'add' : 'subtract'} ${Math.abs(delta)}: ${start} ${delta >= 0 ? '+' : '−'} ${Math.abs(delta)} = ${answerDisplay}.`,
      ],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

export const generators = [compareIntegers, absoluteValue, addSubtractIntegers, multiplyDivideIntegers, numberLineWordProblem];
