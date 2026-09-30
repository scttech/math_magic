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
      const answerDisplay = `${answer}`;
      return {
        promptText: `Evaluate ${coeff}(${bDisplay}) when ${VARIABLE} = ${value}.`,
        answer,
        answerDisplay,
        checkAnswer: numericCheckAnswer(answer, 1e-9),
        meta: { generatorId: evaluateExpression.id, difficulty, coeff, constant, value, answerDisplay },
      };
    }
    const expr = formatLinearExpression({ coeff, constant: difficulty === 'easy' ? 0 : constant });
    const answer = coeff * value + (difficulty === 'easy' ? 0 : constant);
    const answerDisplay = `${answer}`;
    return {
      promptText: `Evaluate ${expr} when ${VARIABLE} = ${value}.`,
      answer,
      answerDisplay,
      checkAnswer: numericCheckAnswer(answer, 1e-9),
      meta: { generatorId: evaluateExpression.id, difficulty, coeff, constant, value, answerDisplay },
    };
  },
  explain(meta) {
    const { difficulty, coeff, constant, value, answerDisplay } = meta;
    if (difficulty === 'hard') {
      const inner = value + constant;
      const constantText = constant < 0 ? `− ${Math.abs(constant)}` : `+ ${constant}`;
      return {
        strategy: [
          'Substitute the given value for the variable.',
          'Do the operation inside the parentheses first.',
          'Multiply by the number outside the parentheses.',
        ],
        workedSteps: [
          `Substitute ${VARIABLE} = ${value}: ${coeff}(${value} ${constantText}).`,
          `Add inside the parentheses first: ${value} + (${constant}) = ${inner}.`,
          `Multiply: ${coeff} × ${inner} = ${answerDisplay}.`,
        ],
        finalAnswerDisplay: answerDisplay,
      };
    }
    const usedConstant = difficulty === 'easy' ? 0 : constant;
    const constantPhrase = usedConstant !== 0 ? (usedConstant < 0 ? ` − ${Math.abs(usedConstant)}` : ` + ${usedConstant}`) : '';
    return {
      strategy: ['Substitute the given value for the variable.', 'Multiply, then add or subtract, following order of operations.'],
      workedSteps: [
        `Substitute ${VARIABLE} = ${value}: ${coeff} × ${value}${constantPhrase}.`,
        usedConstant !== 0
          ? `${coeff} × ${value} = ${coeff * value}, then ${usedConstant < 0 ? 'subtract' : 'add'} ${Math.abs(usedConstant)}: ${answerDisplay}.`
          : `${coeff} × ${value} = ${answerDisplay}.`,
      ],
      finalAnswerDisplay: answerDisplay,
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
      const answerDisplay = formatLinearExpression(result);
      return {
        promptText: `Simplify: ${a}(${bDisplay}) ${cDisplay}`,
        answer: result,
        answerDisplay,
        checkAnswer: linearExpressionCheckAnswer(result),
        meta: { generatorId: simplifyExpression.id, difficulty, a, b, c, answerDisplay },
      };
    }

    const coeffA = randomNonZeroInt(rng, -range, range);
    const coeffB = randomNonZeroInt(rng, -range, range);
    const constant = difficulty === 'easy' ? 0 : randomInt(rng, -range, range);
    const bDisplay = coeffB < 0 ? `- ${Math.abs(coeffB)}${VARIABLE}` : `+ ${coeffB}${VARIABLE}`;
    const constantDisplay = constant === 0 ? '' : constant < 0 ? ` - ${Math.abs(constant)}` : ` + ${constant}`;
    const result = { coeff: coeffA + coeffB, constant };
    const answerDisplay = formatLinearExpression(result);
    return {
      promptText: `Simplify: ${coeffA}${VARIABLE} ${bDisplay}${constantDisplay}`,
      answer: result,
      answerDisplay,
      checkAnswer: linearExpressionCheckAnswer(result),
      meta: { generatorId: simplifyExpression.id, difficulty, coeffA, coeffB, constant, answerDisplay },
    };
  },
  explain(meta) {
    const { difficulty, answerDisplay } = meta;
    if (difficulty === 'hard') {
      const { a, b, c } = meta;
      return {
        strategy: [
          'Distribute: multiply the number outside the parentheses by each term inside.',
          'Combine like terms (the x-terms together, and the plain numbers together).',
        ],
        workedSteps: [
          `Distribute ${a} into the parentheses: ${a} × ${VARIABLE} + ${a} × (${b}) = ${a}${VARIABLE} + ${a * b}.`,
          `Combine with the remaining ${c}${VARIABLE} term: ${a}${VARIABLE} + ${c}${VARIABLE} = ${a + c}${VARIABLE}.`,
          `Result: ${answerDisplay}.`,
        ],
        finalAnswerDisplay: answerDisplay,
      };
    }
    const { coeffA, coeffB, constant } = meta;
    return {
      strategy: ['Combine the x-terms (add their coefficients).', 'Combine the plain numbers.'],
      workedSteps: [
        `Combine the ${VARIABLE}-terms: ${coeffA}${VARIABLE} + ${coeffB}${VARIABLE} = ${coeffA + coeffB}${VARIABLE}.`,
        constant !== 0 ? `The plain number stays as-is: ${constant}.` : 'There is no plain number to combine.',
        `Result: ${answerDisplay}.`,
      ],
      finalAnswerDisplay: answerDisplay,
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
      const answerDisplay = `${solution}`;
      return {
        promptText: `${VARIABLE} ${symbol} ${Math.abs(b)} = ${c}. Solve for ${VARIABLE}.`,
        answer: solution,
        answerDisplay,
        checkAnswer: numericCheckAnswer(solution, 1e-9),
        meta: { generatorId: solveEquation.id, difficulty, b, c, answerDisplay },
      };
    }

    // a*x + b = c (two-step), with a chosen so the equation solves to an integer.
    const maxA = difficulty === 'medium' ? 6 : 9;
    const a = randomNonZeroInt(rng, -maxA, maxA);
    const b = randomInt(rng, -15, 15);
    const c = a * solution + b;
    const bDisplay = b === 0 ? '' : b < 0 ? ` - ${Math.abs(b)}` : ` + ${b}`;
    const answerDisplay = `${solution}`;
    return {
      promptText: `${a}${VARIABLE}${bDisplay} = ${c}. Solve for ${VARIABLE}.`,
      answer: solution,
      answerDisplay,
      checkAnswer: numericCheckAnswer(solution, 1e-9),
      meta: { generatorId: solveEquation.id, difficulty, a, b, c, answerDisplay },
    };
  },
  explain(meta) {
    const { difficulty, c, answerDisplay } = meta;
    if (difficulty === 'easy') {
      const { b } = meta;
      const symbol = b < 0 ? '−' : '+';
      return {
        strategy: [`Undo the ${b < 0 ? 'subtraction' : 'addition'} by doing the opposite to both sides.`],
        workedSteps: [
          `${VARIABLE} ${symbol} ${Math.abs(b)} = ${c}`,
          `${b < 0 ? 'Add' : 'Subtract'} ${Math.abs(b)} on both sides: ${VARIABLE} = ${c} ${b < 0 ? '+' : '−'} ${Math.abs(b)} = ${answerDisplay}.`,
        ],
        finalAnswerDisplay: answerDisplay,
      };
    }
    const { a, b } = meta;
    const afterSubtract = c - b;
    return {
      strategy: [
        'Undo the addition or subtraction first: do the opposite to both sides.',
        'Then undo the multiplication by dividing both sides by the coefficient.',
      ],
      workedSteps: [
        b !== 0
          ? `${b < 0 ? 'Add' : 'Subtract'} ${Math.abs(b)} on both sides: ${a}${VARIABLE} = ${c} ${b < 0 ? '+' : '−'} ${Math.abs(b)} = ${afterSubtract}.`
          : `The equation is already ${a}${VARIABLE} = ${c}.`,
        `Divide both sides by ${a}: ${VARIABLE} = ${afterSubtract} ÷ ${a} = ${answerDisplay}.`,
      ],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Evaluating whole-number exponents ---------------------------------------

const SUPERSCRIPTS = { 2: '²', 3: '³' };

function formatPower(base, exponent) {
  return `${base}${SUPERSCRIPTS[exponent]}`;
}

const evaluateExponent = {
  id: 'grade6.expressionsEquations.evaluateExponent',
  grade: GRADE,
  topic: TOPIC,
  label: 'Evaluating Exponents',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const base = randomInt(rng, 2, difficulty === 'medium' ? 8 : 6);
    const exponent = difficulty === 'easy' ? 2 : randomChoice(rng, [2, 3]);
    const power = base ** exponent;
    const powerDisplay = formatPower(base, exponent);

    if (difficulty !== 'hard') {
      const answerDisplay = `${power}`;
      return {
        promptText: `What is ${powerDisplay}?`,
        answer: power,
        answerDisplay,
        checkAnswer: numericCheckAnswer(power, 1e-9),
        meta: { generatorId: evaluateExponent.id, difficulty, base, exponent, answerDisplay },
      };
    }

    const op = randomChoice(rng, ['add', 'multiply']);
    const extra = randomInt(rng, 2, 10);
    const answer = op === 'add' ? power + extra : power * extra;
    const symbol = op === 'add' ? '+' : '×';
    const answerDisplay = `${answer}`;
    return {
      promptText: `What is ${powerDisplay} ${symbol} ${extra}?`,
      answer,
      answerDisplay,
      checkAnswer: numericCheckAnswer(answer, 1e-9),
      meta: { generatorId: evaluateExponent.id, difficulty, base, exponent, op, extra, answerDisplay },
    };
  },
  explain(meta) {
    const { difficulty, base, exponent, answerDisplay } = meta;
    const powerDisplay = formatPower(base, exponent);
    const expanded = Array(exponent).fill(base).join(' × ');
    const power = base ** exponent;
    if (difficulty !== 'hard') {
      return {
        strategy: [`${powerDisplay} means ${base} multiplied by itself ${exponent} times.`],
        workedSteps: [`${powerDisplay} = ${expanded} = ${answerDisplay}.`],
        finalAnswerDisplay: answerDisplay,
      };
    }
    const { op, extra } = meta;
    const symbol = op === 'add' ? '+' : '×';
    return {
      strategy: ['Evaluate the exponent first (order of operations).', `Then ${op === 'add' ? 'add' : 'multiply by'} the remaining number.`],
      workedSteps: [`${powerDisplay} = ${expanded} = ${power}.`, `${power} ${symbol} ${extra} = ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Identifying parts of an expression --------------------------------------

const identifyExpressionParts = {
  id: 'grade6.expressionsEquations.identifyExpressionParts',
  grade: GRADE,
  topic: TOPIC,
  label: 'Identifying Parts of an Expression',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const range = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20;
    const coeff = randomNonZeroInt(rng, -range, range);
    const constant = difficulty === 'easy' ? randomNonZeroInt(rng, -range, range) : randomInt(rng, -range, range);
    const expr = formatLinearExpression({ coeff, constant });
    const termCount = constant === 0 ? 1 : 2;
    const askable = constant !== 0 ? ['coefficient', 'constant', 'termCount'] : ['coefficient', 'termCount'];
    const ask = randomChoice(rng, askable);

    if (ask === 'coefficient') {
      const answerDisplay = `${coeff}`;
      return {
        promptText: `What is the coefficient of ${VARIABLE} in the expression ${expr}?`,
        answer: coeff,
        answerDisplay,
        checkAnswer: numericCheckAnswer(coeff, 1e-9),
        meta: { generatorId: identifyExpressionParts.id, difficulty, ask, coeff, constant, expr, answerDisplay },
      };
    }
    if (ask === 'constant') {
      const answerDisplay = `${constant}`;
      return {
        promptText: `What is the constant term in the expression ${expr}?`,
        answer: constant,
        answerDisplay,
        checkAnswer: numericCheckAnswer(constant, 1e-9),
        meta: { generatorId: identifyExpressionParts.id, difficulty, ask, coeff, constant, expr, answerDisplay },
      };
    }
    const answerDisplay = `${termCount}`;
    return {
      promptText: `How many terms are in the expression ${expr}?`,
      answer: termCount,
      answerDisplay,
      checkAnswer: numericCheckAnswer(termCount, 1e-9),
      meta: { generatorId: identifyExpressionParts.id, difficulty, ask, coeff, constant, expr, answerDisplay },
    };
  },
  explain(meta) {
    const { ask, coeff, constant, expr, answerDisplay } = meta;
    if (ask === 'coefficient') {
      return {
        strategy: [`The coefficient is the number multiplied by ${VARIABLE}, even when it's just an unwritten 1 or -1.`],
        workedSteps: [`In ${expr}, the number attached to ${VARIABLE} is ${answerDisplay}.`],
        finalAnswerDisplay: answerDisplay,
      };
    }
    if (ask === 'constant') {
      return {
        strategy: ['The constant term is the part of the expression with no variable attached.'],
        workedSteps: [`In ${expr}, the number by itself (no ${VARIABLE}) is ${answerDisplay}.`],
        finalAnswerDisplay: answerDisplay,
      };
    }
    return {
      strategy: ['A term is a number, a variable, or a number and variable multiplied together, separated from other terms by + or -.'],
      workedSteps: [
        `${expr} has ${answerDisplay} term(s)${constant !== 0 ? `: ${formatLinearExpression({ coeff, constant: 0 })} and ${constant}` : `: ${expr}`}.`,
      ],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Checking whether a value is a solution ----------------------------------

function yesNoCheckAnswer(expectedYes) {
  return (userInput) => {
    if (typeof userInput !== 'string') return false;
    const cleaned = userInput.trim().toLowerCase();
    const isYes = cleaned === 'yes' || cleaned === 'y' || cleaned === 'true';
    const isNo = cleaned === 'no' || cleaned === 'n' || cleaned === 'false';
    if (!isYes && !isNo) return false;
    return isYes === expectedYes;
  };
}

const isASolution = {
  id: 'grade6.expressionsEquations.isASolution',
  grade: GRADE,
  topic: TOPIC,
  label: 'Checking Solutions',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const range = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 12 : 15;
    const kind = randomChoice(rng, ['equation', 'inequality']);

    if (kind === 'equation') {
      const maxA = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 7 : 9;
      const a = randomNonZeroInt(rng, -maxA, maxA);
      const b = randomInt(rng, -range, range);
      const solution = randomInt(rng, -range, range);
      const c = a * solution + b;
      const useSolution = randomChoice(rng, [true, false]);
      const candidate = useSolution ? solution : solution + randomNonZeroInt(rng, -5, 5);
      const isTrue = a * candidate + b === c;
      const bDisplay = b === 0 ? '' : b < 0 ? ` - ${Math.abs(b)}` : ` + ${b}`;
      const answerDisplay = isTrue ? 'Yes' : 'No';
      return {
        promptText: `Is ${VARIABLE} = ${candidate} a solution to the equation ${a}${VARIABLE}${bDisplay} = ${c}?`,
        answer: isTrue,
        answerDisplay,
        checkAnswer: yesNoCheckAnswer(isTrue),
        meta: { generatorId: isASolution.id, difficulty, kind, a, b, c, candidate, answerDisplay },
      };
    }

    const threshold = randomInt(rng, -range, range);
    const symbol = randomChoice(rng, ['>', '<', '≥', '≤']);
    const candidate = randomChoice(rng, [true, false]) ? threshold : threshold + randomNonZeroInt(rng, -6, 6);
    const isTrue =
      symbol === '>' ? candidate > threshold : symbol === '<' ? candidate < threshold : symbol === '≥' ? candidate >= threshold : candidate <= threshold;
    const answerDisplay = isTrue ? 'Yes' : 'No';
    return {
      promptText: `Does ${VARIABLE} = ${candidate} satisfy the inequality ${VARIABLE} ${symbol} ${threshold}?`,
      answer: isTrue,
      answerDisplay,
      checkAnswer: yesNoCheckAnswer(isTrue),
      meta: { generatorId: isASolution.id, difficulty, kind, threshold, symbol, candidate, answerDisplay },
    };
  },
  explain(meta) {
    const { kind, candidate, answerDisplay } = meta;
    if (kind === 'equation') {
      const { a, b, c } = meta;
      const bDisplay = b === 0 ? '' : b < 0 ? ` − ${Math.abs(b)}` : ` + ${b}`;
      const substituted = a * candidate + b;
      return {
        strategy: ['Substitute the given value into the equation.', 'If both sides come out equal, it is a solution — otherwise it is not.'],
        workedSteps: [
          `Substitute ${VARIABLE} = ${candidate}: ${a}(${candidate})${bDisplay} = ${substituted}.`,
          substituted === c ? `${substituted} = ${c}, so it checks out.` : `${substituted} ≠ ${c}, so it does not check out.`,
          `Answer: ${answerDisplay}.`,
        ],
        finalAnswerDisplay: answerDisplay,
      };
    }
    const { threshold, symbol } = meta;
    return {
      strategy: ['Substitute the given value in place of the variable.', 'Check whether the resulting statement is true.'],
      workedSteps: [`Substitute ${VARIABLE} = ${candidate}: is ${candidate} ${symbol} ${threshold}?`, `Answer: ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Writing an inequality from a phrase -------------------------------------

const INEQUALITY_PHRASES = [
  { phrase: 'at least', symbol: '≥' },
  { phrase: 'more than', symbol: '>' },
  { phrase: 'at most', symbol: '≤' },
  { phrase: 'less than', symbol: '<' },
];

function normalizeInequalitySymbol(raw) {
  if (raw === '>=' || raw === '≥') return '≥';
  if (raw === '<=' || raw === '≤') return '≤';
  return raw;
}

function inequalityCheckAnswer(symbol, threshold) {
  return (userInput) => {
    if (typeof userInput !== 'string') return false;
    const cleaned = userInput.trim().replace(/\s+/g, '');
    const withoutVar = /^[a-zA-Z]/.test(cleaned) ? cleaned.slice(1) : cleaned;
    const match = /^(>=|<=|≥|≤|>|<)(-?\d+(?:\.\d+)?)$/.exec(withoutVar);
    if (!match) return false;
    return normalizeInequalitySymbol(match[1]) === symbol && Number(match[2]) === threshold;
  };
}

const writeInequality = {
  id: 'grade6.expressionsEquations.writeInequality',
  grade: GRADE,
  topic: TOPIC,
  label: 'Writing Inequalities',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const range = difficulty === 'easy' ? 12 : difficulty === 'medium' ? 25 : 50;
    const threshold = randomInt(rng, 1, range);
    const { phrase, symbol } = randomChoice(rng, INEQUALITY_PHRASES);
    const answerDisplay = `${VARIABLE} ${symbol} ${threshold}`;
    return {
      promptText: `Write an inequality for: "The value of ${VARIABLE} is ${phrase} ${threshold}."`,
      answer: { symbol, threshold },
      answerDisplay,
      checkAnswer: inequalityCheckAnswer(symbol, threshold),
      meta: { generatorId: writeInequality.id, difficulty, phrase, symbol, threshold, answerDisplay },
    };
  },
  explain(meta) {
    const { phrase, symbol, threshold, answerDisplay } = meta;
    return {
      strategy: ['"At least" means ≥, "at most" means ≤.', '"More than" means >, "less than" means <.'],
      workedSteps: [`"${phrase}" translates to the symbol ${symbol}.`, `Write the variable, the symbol, and the number: ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

export const generators = [
  evaluateExpression,
  simplifyExpression,
  solveEquation,
  evaluateExponent,
  identifyExpressionParts,
  isASolution,
  writeInequality,
];
export { formatLinearExpression, parseLinearExpression };
