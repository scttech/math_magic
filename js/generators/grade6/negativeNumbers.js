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
      meta: { generatorId: compareIntegers.id, difficulty },
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
    return {
      promptText: `What is |${value}|?`,
      answer,
      answerDisplay: `${answer}`,
      checkAnswer: numericCheckAnswer(answer, 1e-9),
      meta: { generatorId: absoluteValue.id, difficulty },
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
    return {
      promptText: `${a} ${symbol} ${bDisplay} = ?`,
      answer,
      answerDisplay: `${answer}`,
      checkAnswer: numericCheckAnswer(answer, 1e-9),
      meta: { generatorId: addSubtractIntegers.id, difficulty },
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
      return {
        promptText: `${a} × ${b} = ?`,
        answer,
        answerDisplay: `${answer}`,
        checkAnswer: numericCheckAnswer(answer, 1e-9),
        meta: { generatorId: multiplyDivideIntegers.id, difficulty },
      };
    }
    const divisor = randomInt(rng, 1, maxFactor) * bSign;
    const quotient = randomInt(rng, 1, maxFactor) * aSign;
    const dividend = divisor * quotient;
    return {
      promptText: `${dividend} ÷ ${divisor} = ?`,
      answer: quotient,
      answerDisplay: `${quotient}`,
      checkAnswer: numericCheckAnswer(quotient, 1e-9),
      meta: { generatorId: multiplyDivideIntegers.id, difficulty },
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
    return {
      promptText: `${scenario.subject} ${start}${scenario.unit}. It ${scenario.changeVerb(delta)} ${magnitude}${scenario.unit}. What is the new value?`,
      answer,
      answerDisplay: `${answer}`,
      checkAnswer: numericCheckAnswer(answer, 1e-9),
      meta: { generatorId: numberLineWordProblem.id, difficulty },
    };
  },
};

export const generators = [compareIntegers, absoluteValue, addSubtractIntegers, multiplyDivideIntegers, numberLineWordProblem];
