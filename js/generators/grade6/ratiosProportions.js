import { randomInt, randomChoice } from '../../core/rng.js';
import { gcd, numericCheckAnswer } from '../../core/problemGenerator.js';

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
    return {
      promptText: `Simplify the ratio ${a}:${b} to lowest terms.`,
      answer: `${reducedA}:${reducedB}`,
      answerDisplay: `${reducedA}:${reducedB}`,
      checkAnswer: ratioCheckAnswer(reducedA, reducedB),
      meta: { generatorId: simplifyRatio.id, difficulty },
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
    return {
      promptText: `${a}/${b} = ${c}/x. What is x?`,
      answer: missing,
      answerDisplay: `${missing}`,
      checkAnswer: numericCheckAnswer(missing, 1e-9),
      meta: { generatorId: solveProportion.id, difficulty },
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
    return {
      promptText: `${scenario.verb} ${a} ${scenario.unit} for every ${b} ${scenario.per}. How many ${scenario.unit} are needed for ${targetPer} ${scenario.per}?`,
      answer,
      answerDisplay: `${answer}`,
      checkAnswer: numericCheckAnswer(answer, 1e-9),
      meta: { generatorId: unitRateWordProblem.id, difficulty },
    };
  },
};

export const generators = [simplifyRatio, solveProportion, unitRateWordProblem];
