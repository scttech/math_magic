// 5.OA: evaluating and writing numerical expressions with grouping symbols,
// and analyzing patterns from given rules.
import { randomInt, randomChoice } from '../../core/rng.js';
import { numericCheckAnswer } from '../../core/problemGenerator.js';

const GRADE = '5';
const TOPIC = 'orderOfOperations';

// --- Evaluating expressions with grouping symbols (5.OA.A.1) -------------------

const evaluateExpression = {
  id: 'grade5.orderOfOperations.evaluateExpression',
  grade: GRADE,
  topic: TOPIC,
  label: 'Evaluating Expressions with Parentheses',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const range = difficulty === 'hard' ? 12 : difficulty === 'medium' ? 15 : 9;
    const a = randomInt(rng, 2, range);
    const b = randomInt(rng, 2, range);
    const c = randomInt(rng, 2, range);

    if (difficulty !== 'hard') {
      const shape = randomChoice(rng, ['addMul', 'subMul', 'mulAdd']);
      if (shape === 'addMul') {
        const answer = (a + b) * c;
        return {
          promptText: `(${a} + ${b}) × ${c} = ?`,
          answer,
          answerDisplay: `${answer}`,
          checkAnswer: numericCheckAnswer(answer, 1e-9),
          meta: { generatorId: evaluateExpression.id, difficulty, shape, a, b, c, answerDisplay: `${answer}` },
        };
      }
      if (shape === 'subMul') {
        const [hi, lo] = a >= b ? [a, b] : [b, a];
        const answer = (hi - lo) * c;
        return {
          promptText: `(${hi} - ${lo}) × ${c} = ?`,
          answer,
          answerDisplay: `${answer}`,
          checkAnswer: numericCheckAnswer(answer, 1e-9),
          meta: { generatorId: evaluateExpression.id, difficulty, shape, a: hi, b: lo, c, answerDisplay: `${answer}` },
        };
      }
      const answer = a * (b + c);
      return {
        promptText: `${a} × (${b} + ${c}) = ?`,
        answer,
        answerDisplay: `${answer}`,
        checkAnswer: numericCheckAnswer(answer, 1e-9),
        meta: { generatorId: evaluateExpression.id, difficulty, shape, a, b, c, answerDisplay: `${answer}` },
      };
    }

    const d = randomInt(rng, 2, range);
    const answer = (a + b) * c - d;
    const answerDisplay = `${answer}`;
    return {
      promptText: `[(${a} + ${b}) × ${c}] - ${d} = ?`,
      answer,
      answerDisplay,
      checkAnswer: numericCheckAnswer(answer, 1e-9),
      meta: { generatorId: evaluateExpression.id, difficulty, shape: 'nested', a, b, c, d, answerDisplay },
    };
  },
  explain(meta) {
    const { shape, a, b, c, answerDisplay } = meta;
    const strategy = ['Work inside the innermost parentheses or brackets first.', 'Then do the remaining multiplication, division, addition, or subtraction in order.'];
    if (shape === 'addMul') {
      return { strategy, workedSteps: [`Add inside the parentheses first: ${a} + ${b} = ${a + b}.`, `Multiply: ${a + b} × ${c} = ${answerDisplay}.`], finalAnswerDisplay: answerDisplay };
    }
    if (shape === 'subMul') {
      return { strategy, workedSteps: [`Subtract inside the parentheses first: ${a} - ${b} = ${a - b}.`, `Multiply: ${a - b} × ${c} = ${answerDisplay}.`], finalAnswerDisplay: answerDisplay };
    }
    if (shape === 'mulAdd') {
      return { strategy, workedSteps: [`Add inside the parentheses first: ${b} + ${c} = ${b + c}.`, `Multiply: ${a} × ${b + c} = ${answerDisplay}.`], finalAnswerDisplay: answerDisplay };
    }
    const { d } = meta;
    return {
      strategy,
      workedSteps: [`Work inside the parentheses first: ${a} + ${b} = ${a + b}.`, `Then the brackets: ${a + b} × ${c} = ${(a + b) * c}.`, `Finally, subtract: ${(a + b) * c} - ${d} = ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Writing an expression from a phrase, without evaluating it (5.OA.A.2) -----

const EXPRESSION_PHRASE_TEMPLATES = [
  (a, b, c) => ({ phrase: `Add ${a} and ${b}, then multiply by ${c}`, expr: `(${a} + ${b}) × ${c}` }),
  (a, b, c) => ({ phrase: `Subtract ${b} from ${a}, then multiply by ${c}`, expr: `(${a} - ${b}) × ${c}` }),
  (a, b, c) => ({ phrase: `Add ${a} and ${b}, then divide by ${c}`, expr: `(${a} + ${b}) ÷ ${c}` }),
  (a, b, c) => ({ phrase: `Multiply ${a} by the sum of ${b} and ${c}`, expr: `${a} × (${b} + ${c})` }),
];

function normalizeExpr(str) {
  return String(str)
    .replace(/\s+/g, '')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .toLowerCase();
}

function expressionCheckAnswer(canonical) {
  const target = normalizeExpr(canonical);
  return (userInput) => typeof userInput === 'string' && normalizeExpr(userInput) === target;
}

const writeExpression = {
  id: 'grade5.orderOfOperations.writeExpression',
  grade: GRADE,
  topic: TOPIC,
  label: 'Writing Numerical Expressions',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const range = difficulty === 'easy' ? 9 : difficulty === 'medium' ? 15 : 20;
    // a >= b always, so "subtract b from a" never implies a negative result — 5th grade doesn't work with negative numbers yet.
    const hi = randomInt(rng, 3, range);
    const lo = randomInt(rng, 2, hi - 1);
    const c = randomInt(rng, 2, difficulty === 'easy' ? 9 : 12);
    const template = randomChoice(rng, EXPRESSION_PHRASE_TEMPLATES);
    const { phrase, expr } = template(hi, lo, c);
    return {
      promptText: `Write a numerical expression for: "${phrase}." (Don't evaluate it — just write the expression.)`,
      answer: expr,
      answerDisplay: expr,
      checkAnswer: expressionCheckAnswer(expr),
      meta: { generatorId: writeExpression.id, difficulty, phrase, answerDisplay: expr },
    };
  },
  explain(meta) {
    const { phrase, answerDisplay } = meta;
    return {
      strategy: ['Translate each part of the phrase into numbers and operation symbols, in the order described.', 'Use parentheses to group whichever operation has to happen first.'],
      workedSteps: [`"${phrase}" becomes ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Numerical patterns from two rules (5.OA.B.3) -------------------------------

function ordinalSuffix(n) {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return 'th';
  switch (n % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

function buildSequence(step, count) {
  const seq = [0];
  for (let i = 1; i < count; i++) seq.push(seq[i - 1] + step);
  return seq;
}

const numericalPatterns = {
  id: 'grade5.orderOfOperations.numericalPatterns',
  grade: GRADE,
  topic: TOPIC,
  label: 'Numerical Patterns',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const stepA = randomInt(rng, 2, difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 12);
    const multiplier = randomInt(rng, 2, 3);
    const stepB = stepA * multiplier;
    const count = 6;
    const seqA = buildSequence(stepA, count);
    const seqB = buildSequence(stepB, count);
    const ask = randomChoice(rng, ['nthTermA', 'nthTermB', 'relationship']);

    if (ask === 'relationship') {
      const answerDisplay = `${multiplier}`;
      return {
        promptText: `Sequence A starts at 0 and follows the rule "add ${stepA}": ${seqA.join(', ')}, ... Sequence B starts at 0 and follows the rule "add ${stepB}": ${seqB.join(', ')}, ... Each term in Sequence B is how many times the corresponding term in Sequence A?`,
        answer: multiplier,
        answerDisplay,
        checkAnswer: numericCheckAnswer(multiplier, 1e-9),
        meta: { generatorId: numericalPatterns.id, difficulty, ask, stepA, stepB, multiplier, answerDisplay },
      };
    }

    const label = ask === 'nthTermA' ? 'A' : 'B';
    const step = ask === 'nthTermA' ? stepA : stepB;
    const seq = ask === 'nthTermA' ? seqA : seqB;
    const termIndex = randomInt(rng, count, count + 3);
    const termNumber = termIndex + 1;
    const value = step * termIndex;
    const answerDisplay = `${value}`;
    return {
      promptText: `Sequence ${label} starts at 0 and follows the rule "add ${step}": ${seq.join(', ')}, ... What is the ${termNumber}${ordinalSuffix(termNumber)} term?`,
      answer: value,
      answerDisplay,
      checkAnswer: numericCheckAnswer(value, 1e-9),
      meta: { generatorId: numericalPatterns.id, difficulty, ask, label, step, termNumber, answerDisplay },
    };
  },
  explain(meta) {
    const { ask, answerDisplay } = meta;
    if (ask === 'relationship') {
      const { stepA, stepB, multiplier } = meta;
      return {
        strategy: ['Compare the corresponding terms of each sequence (both starting from 0) to see the relationship between them.'],
        workedSteps: [`Sequence A's rule is "add ${stepA}" and Sequence B's rule is "add ${stepB}".`, `${stepB} ÷ ${stepA} = ${multiplier}, so each Sequence B term is ${multiplier} times the matching Sequence A term.`],
        finalAnswerDisplay: answerDisplay,
      };
    }
    const { label, step, termNumber } = meta;
    return {
      strategy: ['Both sequences start at 0, so the Nth term is just the rule’s step size times (N − 1).'],
      workedSteps: [`The ${termNumber}${ordinalSuffix(termNumber)} term of Sequence ${label} is term number ${termNumber - 1} steps after the start: ${step} × ${termNumber - 1} = ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

export const generators = [evaluateExpression, writeExpression, numericalPatterns];
