import { randomInt, randomChoice } from '../../core/rng.js';
import { gcd, numericCheckAnswer } from '../../core/problemGenerator.js';

const GRADE = '6';
const TOPIC = 'numberTheory';

// --- Long division (6.NS.B.2) -------------------------------------------------

function factorsOf(n) {
  const result = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) result.push(i);
  return result;
}

function multiplesUpTo(n, limit) {
  const result = [];
  for (let m = n; m <= limit; m += n) result.push(m);
  return result;
}

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

const longDivision = {
  id: 'grade6.numberTheory.longDivision',
  grade: GRADE,
  topic: TOPIC,
  label: 'Long Division',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const divisor = difficulty === 'easy' ? randomInt(rng, 2, 9) : difficulty === 'medium' ? randomInt(rng, 2, 12) : randomInt(rng, 11, 25);
    const quotient = difficulty === 'easy' ? randomInt(rng, 10, 99) : difficulty === 'medium' ? randomInt(rng, 50, 500) : randomInt(rng, 20, 80);
    const remainder = difficulty === 'hard' ? randomInt(rng, 0, divisor - 1) : 0;
    const dividend = divisor * quotient + remainder;
    const answerDisplay = remainder === 0 ? `${quotient}` : `${quotient} R ${remainder}`;
    const hint = remainder === 0 ? '' : ' If there is a remainder, write it like "23 R 4".';
    return {
      promptText: `What is ${dividend} ÷ ${divisor}?${hint}`,
      answer: { quotient, remainder },
      answerDisplay,
      checkAnswer: longDivisionCheckAnswer(quotient, remainder),
      meta: { generatorId: longDivision.id, difficulty, dividend, divisor, quotient, remainder, answerDisplay },
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
    if (remainder === 0) {
      steps.push(`${divisor} divides evenly, so the answer is ${answerDisplay}.`);
    } else {
      steps.push(`${remainder} is less than the divisor, so that's the remainder: ${answerDisplay}.`);
    }
    return {
      strategy: ['Use the standard long division algorithm: divide, multiply, subtract, and check what is left over.'],
      workedSteps: steps,
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Greatest common factor (6.NS.B.4) ----------------------------------------

const greatestCommonFactor = {
  id: 'grade6.numberTheory.greatestCommonFactor',
  grade: GRADE,
  topic: TOPIC,
  label: 'Greatest Common Factor',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const max = difficulty === 'easy' ? 24 : difficulty === 'medium' ? 60 : 100;
    const a = randomInt(rng, 4, max);
    const b = randomInt(rng, 4, max);
    const answer = gcd(a, b);
    const answerDisplay = `${answer}`;
    return {
      promptText: `What is the greatest common factor (GCF) of ${a} and ${b}?`,
      answer,
      answerDisplay,
      checkAnswer: numericCheckAnswer(answer, 1e-9),
      meta: { generatorId: greatestCommonFactor.id, difficulty, a, b, answerDisplay },
    };
  },
  explain(meta) {
    const { a, b, answerDisplay } = meta;
    return {
      strategy: ['List the factors of each number.', 'Find the largest factor they have in common.'],
      workedSteps: [`Factors of ${a}: ${factorsOf(a).join(', ')}.`, `Factors of ${b}: ${factorsOf(b).join(', ')}.`, `The greatest shared factor is ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Least common multiple (6.NS.B.4) -----------------------------------------

const leastCommonMultiple = {
  id: 'grade6.numberTheory.leastCommonMultiple',
  grade: GRADE,
  topic: TOPIC,
  label: 'Least Common Multiple',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const max = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 10 : 12;
    const a = randomInt(rng, 2, max);
    const b = randomInt(rng, 2, max);
    const answer = (a * b) / gcd(a, b);
    const answerDisplay = `${answer}`;
    return {
      promptText: `What is the least common multiple (LCM) of ${a} and ${b}?`,
      answer,
      answerDisplay,
      checkAnswer: numericCheckAnswer(answer, 1e-9),
      meta: { generatorId: leastCommonMultiple.id, difficulty, a, b, answer, answerDisplay },
    };
  },
  explain(meta) {
    const { a, b, answer, answerDisplay } = meta;
    return {
      strategy: ['List the multiples of each number.', 'Find the smallest multiple they have in common.'],
      workedSteps: [
        `Multiples of ${a}: ${multiplesUpTo(a, answer).join(', ')}.`,
        `Multiples of ${b}: ${multiplesUpTo(b, answer).join(', ')}.`,
        `The smallest shared multiple is ${answerDisplay}.`,
      ],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Distributive property with the GCF (6.NS.B.4) ----------------------------

function randomCoprimePair(rng, maxVal) {
  let m = 0;
  let n = 0;
  do {
    m = randomInt(rng, 2, maxVal);
    n = randomInt(rng, 2, maxVal);
  } while (m === n || gcd(m, n) !== 1);
  return [m, n];
}

function distributiveCheckAnswer(g, m, n) {
  return (userInput) => {
    if (typeof userInput !== 'string') return false;
    const cleaned = userInput.replace(/\s+/g, '');
    const match = /^(\d+)\((\d+)\+(\d+)\)$/.exec(cleaned);
    if (!match) return false;
    return Number(match[1]) === g && Number(match[2]) === m && Number(match[3]) === n;
  };
}

const distributiveGcf = {
  id: 'grade6.numberTheory.distributiveGcf',
  grade: GRADE,
  topic: TOPIC,
  label: 'Distributive Property with the GCF',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const g = difficulty === 'easy' ? randomInt(rng, 2, 6) : difficulty === 'medium' ? randomInt(rng, 2, 9) : randomInt(rng, 2, 12);
    const maxVal = Math.max(3, Math.min(12, Math.floor(100 / g)));
    const [m, n] = randomCoprimePair(rng, maxVal);
    const a = g * m;
    const b = g * n;
    const answerDisplay = `${g}(${m}+${n})`;
    return {
      promptText: `Use the GCF and the distributive property to write ${a} + ${b} as a product, like "4(9+2)".`,
      answer: { g, m, n },
      answerDisplay,
      checkAnswer: distributiveCheckAnswer(g, m, n),
      meta: { generatorId: distributiveGcf.id, difficulty, a, b, g, m, n, answerDisplay },
    };
  },
  explain(meta) {
    const { a, b, g, m, n, answerDisplay } = meta;
    return {
      strategy: ['Find the GCF of the two numbers.', 'Divide each number by the GCF.', 'Write the GCF times the sum of those quotients.'],
      workedSteps: [`The GCF of ${a} and ${b} is ${g}.`, `${a} ÷ ${g} = ${m} and ${b} ÷ ${g} = ${n}.`, `So ${a} + ${b} = ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

export const generators = [longDivision, greatestCommonFactor, leastCommonMultiple, distributiveGcf];
