import { randomInt, randomChoice } from '../../core/rng.js';
import { numericCheckAnswer } from '../../core/problemGenerator.js';

const GRADE = '6';
const TOPIC = 'expressionsEquations';
const VARIABLE = 'x';

function randomNonZeroInt(rng, min, max) {
  let value = 0;
  while (value === 0) value = randomInt(rng, min, max);
  return value;
}

/** Format a linear expression {coeff, constant} as a canonical string, e.g. "8x - 2", "-x + 5", "7". */
function formatLinearExpression({ coeff, constant }) {
  let coeffPart = '';
  if (coeff !== 0) {
    const abs = Math.abs(coeff);
    coeffPart = `${coeff < 0 ? '-' : ''}${abs === 1 ? '' : abs}${VARIABLE}`;
  }
  if (constant === 0) return coeffPart || '0';
  const constantPart = `${constant < 0 ? '- ' : coeffPart ? '+ ' : ''}${Math.abs(constant)}`;
  return coeffPart ? `${coeffPart} ${constantPart}` : `${constant}`;
}

/** Parse a linear expression string like "8x - 2" or "-x+5" into {coeff, constant}. */
function parseLinearExpression(str) {
  const cleaned = String(str).replace(/\s+/g, '');
  const withLeadingSign = /^[+-]/.test(cleaned) ? cleaned : `+${cleaned}`;
  const terms = withLeadingSign.match(/[+-][^+-]+/g) || [];
  let coeff = 0;
  let constant = 0;
  for (const term of terms) {
    if (term.includes(VARIABLE)) {
      const numPart = term.replace(VARIABLE, '');
      const sign = numPart[0] === '-' ? -1 : 1;
      const digits = numPart.slice(1);
      const value = digits === '' ? 1 : Number(digits);
      if (Number.isNaN(value)) return null;
      coeff += sign * value;
    } else {
      const value = Number(term);
      if (Number.isNaN(value)) return null;
      constant += value;
    }
  }
  return { coeff, constant };
}

function linearExpressionCheckAnswer(expected) {
  return (userInput) => {
    const parsed = parseLinearExpression(userInput);
    return !!parsed && parsed.coeff === expected.coeff && parsed.constant === expected.constant;
  };
}

const evaluateExpression = {
  id: 'grade6.expressionsEquations.evaluateExpression',
  grade: GRADE,
  topic: TOPIC,
  label: 'Evaluating Expressions',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const range = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 12;
    const coeff = randomNonZeroInt(rng, -range, range);
    const constant = randomInt(rng, -range, range);
    const value = randomInt(rng, -range, range);

    if (difficulty === 'hard') {
      // a(x + b) evaluated at x = value
      const answer = coeff * (value + constant);
      const bDisplay = constant < 0 ? `${VARIABLE} - ${Math.abs(constant)}` : `${VARIABLE} + ${constant}`;
      return {
        promptText: `Evaluate ${coeff}(${bDisplay}) when ${VARIABLE} = ${value}.`,
        answer,
        answerDisplay: `${answer}`,
        checkAnswer: numericCheckAnswer(answer, 1e-9),
        meta: { generatorId: evaluateExpression.id, difficulty },
      };
    }
    const expr = formatLinearExpression({ coeff, constant: difficulty === 'easy' ? 0 : constant });
    const answer = coeff * value + (difficulty === 'easy' ? 0 : constant);
    return {
      promptText: `Evaluate ${expr} when ${VARIABLE} = ${value}.`,
      answer,
      answerDisplay: `${answer}`,
      checkAnswer: numericCheckAnswer(answer, 1e-9),
      meta: { generatorId: evaluateExpression.id, difficulty },
    };
  },
};

const simplifyExpression = {
  id: 'grade6.expressionsEquations.simplifyExpression',
  grade: GRADE,
  topic: TOPIC,
  label: 'Simplifying Expressions',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const range = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 12 : 10;

    if (difficulty === 'hard') {
      // Distribute a(x + b) + cx, then combine like terms.
      const a = randomNonZeroInt(rng, -range, range);
      const b = randomInt(rng, -range, range);
      const c = randomNonZeroInt(rng, -range, range);
      const bDisplay = b < 0 ? `${VARIABLE} - ${Math.abs(b)}` : `${VARIABLE} + ${b}`;
      const cDisplay = c < 0 ? `- ${Math.abs(c)}${VARIABLE}` : `+ ${c}${VARIABLE}`;
      const result = { coeff: a + c, constant: a * b };
      return {
        promptText: `Simplify: ${a}(${bDisplay}) ${cDisplay}`,
        answer: result,
        answerDisplay: formatLinearExpression(result),
        checkAnswer: linearExpressionCheckAnswer(result),
        meta: { generatorId: simplifyExpression.id, difficulty },
      };
    }

    const coeffA = randomNonZeroInt(rng, -range, range);
    const coeffB = randomNonZeroInt(rng, -range, range);
    const constant = difficulty === 'easy' ? 0 : randomInt(rng, -range, range);
    const bDisplay = coeffB < 0 ? `- ${Math.abs(coeffB)}${VARIABLE}` : `+ ${coeffB}${VARIABLE}`;
    const constantDisplay = constant === 0 ? '' : constant < 0 ? ` - ${Math.abs(constant)}` : ` + ${constant}`;
    const result = { coeff: coeffA + coeffB, constant };
    return {
      promptText: `Simplify: ${coeffA}${VARIABLE} ${bDisplay}${constantDisplay}`,
      answer: result,
      answerDisplay: formatLinearExpression(result),
      checkAnswer: linearExpressionCheckAnswer(result),
      meta: { generatorId: simplifyExpression.id, difficulty },
    };
  },
};

const solveEquation = {
  id: 'grade6.expressionsEquations.solveEquation',
  grade: GRADE,
  topic: TOPIC,
  label: 'Solving Equations',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const solutionRange = difficulty === 'easy' ? 15 : difficulty === 'medium' ? 12 : 15;
    const solution = randomInt(rng, -solutionRange, solutionRange);

    if (difficulty === 'easy') {
      // x + b = c, or x - b = c
      const b = randomNonZeroInt(rng, -12, 12);
      const c = solution + b;
      const symbol = b < 0 ? '-' : '+';
      return {
        promptText: `${VARIABLE} ${symbol} ${Math.abs(b)} = ${c}. Solve for ${VARIABLE}.`,
        answer: solution,
        answerDisplay: `${solution}`,
        checkAnswer: numericCheckAnswer(solution, 1e-9),
        meta: { generatorId: solveEquation.id, difficulty },
      };
    }

    // a*x + b = c (two-step), with a chosen so the equation solves to an integer.
    const maxA = difficulty === 'medium' ? 6 : 9;
    const a = randomNonZeroInt(rng, -maxA, maxA);
    const b = randomInt(rng, -15, 15);
    const c = a * solution + b;
    const bDisplay = b === 0 ? '' : b < 0 ? ` - ${Math.abs(b)}` : ` + ${b}`;
    return {
      promptText: `${a}${VARIABLE}${bDisplay} = ${c}. Solve for ${VARIABLE}.`,
      answer: solution,
      answerDisplay: `${solution}`,
      checkAnswer: numericCheckAnswer(solution, 1e-9),
      meta: { generatorId: solveEquation.id, difficulty },
    };
  },
};

export const generators = [evaluateExpression, simplifyExpression, solveEquation];
export { formatLinearExpression, parseLinearExpression };
