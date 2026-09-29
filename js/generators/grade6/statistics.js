import { randomInt, randomChoice, shuffle } from '../../core/rng.js';
import { numericCheckAnswer, roundTo } from '../../core/problemGenerator.js';

const GRADE = '6';
const TOPIC = 'statistics';

function mean(values) {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function median(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function range(values) {
  return Math.max(...values) - Math.min(...values);
}

/** Build a dataset of `n` values where `target` is the unique, unambiguous mode. */
function datasetWithUniqueMode(rng, { n, min, max, target }) {
  const repeatCount = Math.max(3, Math.ceil(n / 2));
  const values = new Array(repeatCount).fill(target);
  const others = new Set();
  while (values.length < n) {
    const candidate = randomInt(rng, min, max);
    if (candidate !== target && !others.has(candidate)) {
      others.add(candidate);
      values.push(candidate);
    }
  }
  return shuffle(rng, values);
}

const measuresOfCenter = {
  id: 'grade6.statistics.measuresOfCenter',
  grade: GRADE,
  topic: TOPIC,
  label: 'Mean, Median, Mode & Range',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const n = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 6 : 7;
    const range_ = difficulty === 'easy' ? { min: 1, max: 20 } : difficulty === 'medium' ? { min: 1, max: 40 } : { min: 1, max: 60 };
    const measure = randomChoice(rng, ['mean', 'median', 'mode', 'range']);

    let values;
    if (measure === 'mode') {
      const target = randomInt(rng, range_.min, range_.max);
      values = datasetWithUniqueMode(rng, { n, ...range_, target });
    } else {
      values = Array.from({ length: n }, () => randomInt(rng, range_.min, range_.max));
    }

    const promptText = `Find the ${measure} of this data set: ${values.join(', ')}`;

    if (measure === 'mean') {
      const answer = roundTo(mean(values), 2);
      const answerDisplay = `${answer}`;
      return {
        promptText,
        answer,
        answerDisplay,
        checkAnswer: numericCheckAnswer(answer, 0.01),
        meta: { generatorId: measuresOfCenter.id, difficulty, measure, values, answerDisplay },
      };
    }
    if (measure === 'median') {
      const answer = median(values);
      const answerDisplay = `${answer}`;
      return {
        promptText,
        answer,
        answerDisplay,
        checkAnswer: numericCheckAnswer(answer, 1e-9),
        meta: { generatorId: measuresOfCenter.id, difficulty, measure, values, answerDisplay },
      };
    }
    if (measure === 'mode') {
      const counts = new Map();
      for (const v of values) counts.set(v, (counts.get(v) || 0) + 1);
      const answer = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
      const answerDisplay = `${answer}`;
      return {
        promptText,
        answer,
        answerDisplay,
        checkAnswer: numericCheckAnswer(answer, 1e-9),
        meta: { generatorId: measuresOfCenter.id, difficulty, measure, values, answerDisplay },
      };
    }
    const answer = range(values);
    const answerDisplay = `${answer}`;
    return {
      promptText,
      answer,
      answerDisplay,
      checkAnswer: numericCheckAnswer(answer, 1e-9),
      meta: { generatorId: measuresOfCenter.id, difficulty, measure, values, answerDisplay },
    };
  },
  explain(meta) {
    const { measure, values, answerDisplay } = meta;
    if (measure === 'mean') {
      const sum = values.reduce((s, v) => s + v, 0);
      return {
        strategy: ['Add up all the values.', 'Divide by how many values there are.'],
        workedSteps: [`Add the values: ${values.join(' + ')} = ${sum}.`, `Divide by ${values.length}: ${sum} ÷ ${values.length} = ${answerDisplay}.`],
        finalAnswerDisplay: answerDisplay,
      };
    }
    if (measure === 'median') {
      const sorted = values.slice().sort((a, b) => a - b);
      const mid = sorted.length / 2;
      return {
        strategy: ['Put the values in order from least to greatest.', 'The median is the middle value (or the average of the two middle values).'],
        workedSteps: [
          `Order the values: ${sorted.join(', ')}.`,
          sorted.length % 2 === 0
            ? `There are two middle values, ${sorted[mid - 1]} and ${sorted[mid]}; their average is ${answerDisplay}.`
            : `The middle value is ${answerDisplay}.`,
        ],
        finalAnswerDisplay: answerDisplay,
      };
    }
    if (measure === 'mode') {
      return {
        strategy: ['The mode is the value that appears most often.'],
        workedSteps: [`Count how many times each value appears; ${answerDisplay} appears the most.`],
        finalAnswerDisplay: answerDisplay,
      };
    }
    const sorted = values.slice().sort((a, b) => a - b);
    return {
      strategy: ['The range is the greatest value minus the least value.'],
      workedSteps: [`Greatest value (${sorted[sorted.length - 1]}) − least value (${sorted[0]}) = ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

const frequencyTableQuestions = {
  id: 'grade6.statistics.frequencyTableQuestions',
  grade: GRADE,
  topic: TOPIC,
  label: 'Reading Frequency Tables',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const numCategories = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;
    const maxCount = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 12 : 15;
    const question = randomChoice(rng, ['total', 'mostFrequent']);

    const values = Array.from({ length: numCategories }, (_, i) => i + 1);
    let counts;
    let mostFrequentValue;
    if (question === 'mostFrequent') {
      mostFrequentValue = randomChoice(rng, values);
      counts = values.map((v) => (v === mostFrequentValue ? randomInt(rng, 6, maxCount) : randomInt(rng, 1, 5)));
    } else {
      counts = values.map(() => randomInt(rng, 1, maxCount));
    }

    const tableText = values.map((v, i) => `${v} (${counts[i]} times)`).join(', ');
    const total = counts.reduce((sum, c) => sum + c, 0);

    if (question === 'total') {
      const answerDisplay = `${total}`;
      return {
        promptText: `A survey recorded these responses and how often each occurred: ${tableText}. How many total responses were there?`,
        answer: total,
        answerDisplay,
        checkAnswer: numericCheckAnswer(total, 1e-9),
        meta: { generatorId: frequencyTableQuestions.id, difficulty, question, values, counts, answerDisplay },
      };
    }
    const answerDisplay = `${mostFrequentValue}`;
    return {
      promptText: `A survey recorded these responses and how often each occurred: ${tableText}. Which response occurred most often?`,
      answer: mostFrequentValue,
      answerDisplay,
      checkAnswer: numericCheckAnswer(mostFrequentValue, 1e-9),
      meta: { generatorId: frequencyTableQuestions.id, difficulty, question, values, counts, answerDisplay },
    };
  },
  explain(meta) {
    const { question, values, counts, answerDisplay } = meta;
    const rows = values.map((v, i) => `${v}: ${counts[i]}`).join(', ');
    if (question === 'total') {
      return {
        strategy: ['Add up the counts (frequencies) for every category.'],
        workedSteps: [`Add the counts: ${counts.join(' + ')} = ${answerDisplay}.`],
        finalAnswerDisplay: answerDisplay,
      };
    }
    return {
      strategy: ['Find the category with the largest count (frequency).'],
      workedSteps: [`Compare the counts (${rows}); the largest is for response ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

/**
 * `count` non-negative integers, each at most `maxEach`, that sum to exactly
 * `total` (caller guarantees 0 <= total <= count * maxEach). Used so every
 * value in a mean problem — including the "missing" one — is a plausible
 * data point rather than risking an outlier from independent random draws.
 */
function randomBoundedComposition(rng, count, total, maxEach) {
  const values = [];
  let remaining = total;
  for (let i = 0; i < count; i++) {
    const slotsLeft = count - i - 1;
    const lo = Math.max(0, remaining - slotsLeft * maxEach);
    const hi = Math.min(maxEach, remaining);
    const value = randomInt(rng, lo, hi);
    values.push(value);
    remaining -= value;
  }
  return values;
}

const missingValueGivenMean = {
  id: 'grade6.statistics.missingValueGivenMean',
  grade: GRADE,
  topic: TOPIC,
  label: 'Finding a Missing Value from the Mean',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const n = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 5 : 6;
    const meanValue = difficulty === 'hard' ? randomInt(rng, 5, 25) : randomInt(rng, 3, 15);
    const total = meanValue * n;
    const maxKnown = meanValue * 2;

    const allValues = randomBoundedComposition(rng, n, total, maxKnown);
    const missingIndex = randomInt(rng, 0, n - 1);
    const missing = allValues[missingIndex];
    const knownValues = allValues.filter((_, i) => i !== missingIndex);

    const answerDisplay = `${missing}`;
    return {
      promptText: `The mean of ${n} numbers is ${meanValue}. ${n - 1} of the numbers are: ${knownValues.join(', ')}. What is the missing number?`,
      answer: missing,
      answerDisplay,
      checkAnswer: numericCheckAnswer(missing, 1e-9),
      meta: { generatorId: missingValueGivenMean.id, difficulty, n, meanValue, knownValues, answerDisplay },
    };
  },
  explain(meta) {
    const { n, meanValue, knownValues, answerDisplay } = meta;
    const knownSum = knownValues.reduce((s, v) => s + v, 0);
    const total = meanValue * n;
    return {
      strategy: [
        'Multiply the mean by how many numbers there are to find the total sum of all the numbers.',
        'Subtract the sum of the known numbers from that total to find the missing number.',
      ],
      workedSteps: [
        `The total of all ${n} numbers is mean × count = ${meanValue} × ${n} = ${total}.`,
        `The known numbers add up to ${knownValues.join(' + ')} = ${knownSum}.`,
        `Subtract: ${total} − ${knownSum} = ${answerDisplay}.`,
      ],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

export const generators = [measuresOfCenter, frequencyTableQuestions, missingValueGivenMean];
