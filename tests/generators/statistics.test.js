import { createRng } from '../../js/core/rng.js';
import { generators } from '../../js/generators/grade6/statistics.js';

const byId = Object.fromEntries(generators.map((g) => [g.id, g]));

const fixedSeedFixtures = {
  'grade6.statistics.measuresOfCenter': {
    easy: { promptText: 'Find the range of this data set: 7, 10, 17, 11, 7', answerDisplay: '10' },
    medium: { promptText: 'Find the range of this data set: 13, 20, 33, 21, 14, 3', answerDisplay: '30' },
    hard: { promptText: 'Find the range of this data set: 19, 30, 50, 31, 21, 5, 46', answerDisplay: '45' },
  },
  'grade6.statistics.frequencyTableQuestions': {
    easy: {
      promptText: 'A survey recorded these responses and how often each occurred: 1 (7 times), 2 (5 times), 3 (3 times). Which response occurred most often?',
      answerDisplay: '1',
    },
    medium: {
      promptText:
        'A survey recorded these responses and how often each occurred: 1 (3 times), 2 (11 times), 3 (3 times), 4 (2 times). Which response occurred most often?',
      answerDisplay: '2',
    },
    hard: {
      promptText:
        'A survey recorded these responses and how often each occurred: 1 (3 times), 2 (14 times), 3 (3 times), 4 (2 times), 5 (1 times). Which response occurred most often?',
      answerDisplay: '2',
    },
  },
  'grade6.statistics.missingValueGivenMean': {
    easy: { promptText: 'The mean of 4 numbers is 15. 3 of the numbers are: 9, 26, 10. What is the missing number?', answerDisplay: '15' },
    medium: {
      promptText: 'The mean of 5 numbers is 15. 4 of the numbers are: 15, 25, 13, 13. What is the missing number?',
      answerDisplay: '9',
    },
    hard: {
      promptText: 'The mean of 6 numbers is 25. 5 of the numbers are: 15, 24, 41, 25, 30. What is the missing number?',
      answerDisplay: '15',
    },
  },
};

QUnit.module('generators/grade6/statistics', () => {
  QUnit.test('every generator declares grade 6 and the statistics topic', (assert) => {
    for (const gen of generators) {
      assert.equal(gen.grade, '6', `${gen.id} grade`);
      assert.equal(gen.topic, 'statistics', `${gen.id} topic`);
    }
  });

  for (const [id, byDifficulty] of Object.entries(fixedSeedFixtures)) {
    for (const [difficulty, expected] of Object.entries(byDifficulty)) {
      QUnit.test(`${id} [${difficulty}] is deterministic for seed 12345`, (assert) => {
        const rng = createRng(12345);
        const problem = byId[id].generate({ difficulty, rng });
        assert.equal(problem.promptText, expected.promptText);
        assert.equal(problem.answerDisplay, expected.answerDisplay);
      });
    }
  }

  for (const gen of generators) {
    for (const difficulty of gen.difficulties) {
      QUnit.test(`${gen.id} [${difficulty}] checkAnswer accepts correct and rejects wrong answers`, (assert) => {
        for (let seed = 0; seed < 50; seed++) {
          const rng = createRng(seed);
          const problem = gen.generate({ difficulty, rng });
          assert.ok(problem.checkAnswer(problem.answerDisplay), `seed ${seed}: accepts its own answer for "${problem.promptText}"`);
          assert.notOk(problem.checkAnswer('definitely-not-a-valid-answer'), `seed ${seed}: rejects garbage input`);
        }
      });
    }
  }

  QUnit.test('missingValueGivenMean never produces a negative missing value', (assert) => {
    const gen = byId['grade6.statistics.missingValueGivenMean'];
    for (let seed = 0; seed < 200; seed++) {
      for (const difficulty of gen.difficulties) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        assert.ok(problem.answer >= 0, `seed ${seed}/${difficulty}: non-negative missing value`);
      }
    }
  });

  QUnit.test('statisticalQuestion: the Yes/No answer always matches the question bank entry actually used', (assert) => {
    const gen = byId['grade6.statistics.statisticalQuestion'];
    for (let seed = 0; seed < 100; seed++) {
      const rng = createRng(seed);
      const problem = gen.generate({ difficulty: 'medium', rng });
      assert.ok(problem.promptText.includes(problem.meta.text), `seed ${seed}: prompt quotes the bank question verbatim`);
      assert.equal(problem.answerDisplay, problem.meta.isStatistical ? 'Yes' : 'No', `seed ${seed}: answer matches the bank entry's label`);
      assert.ok(problem.checkAnswer(problem.answerDisplay.toLowerCase()), `seed ${seed}: checkAnswer is case-insensitive`);
    }
  });

  QUnit.test('interquartileRange: Q1/Q3 are the median of the lower/upper half after excluding the overall median for odd counts', (assert) => {
    const gen = byId['grade6.statistics.interquartileRange'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 60; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const { values, q1, q3 } = problem.meta;
        const sorted = values.slice().sort((a, b) => a - b);
        const n = sorted.length;
        const mid = Math.floor(n / 2);
        const lowerHalf = sorted.slice(0, mid);
        const upperHalf = n % 2 === 0 ? sorted.slice(mid) : sorted.slice(mid + 1);
        const medianOf = (arr) => {
          const m = Math.floor(arr.length / 2);
          return arr.length % 2 === 0 ? (arr[m - 1] + arr[m]) / 2 : arr[m];
        };
        assert.equal(q1, medianOf(lowerHalf), `[${difficulty}] seed ${seed}: Q1`);
        assert.equal(q3, medianOf(upperHalf), `[${difficulty}] seed ${seed}: Q3`);
        assert.ok(Math.abs(problem.answer - (q3 - q1)) < 1e-9, `[${difficulty}] seed ${seed}: IQR = Q3 - Q1`);
        assert.ok(q1 <= q3, `[${difficulty}] seed ${seed}: Q1 never exceeds Q3`);
      }
    }
  });

  QUnit.test('meanAbsoluteDeviation: the answer is the average absolute distance from the mean, and is never negative', (assert) => {
    const gen = byId['grade6.statistics.meanAbsoluteDeviation'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 60; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const { values } = problem.meta;
        const dataMean = values.reduce((s, v) => s + v, 0) / values.length;
        const expected = values.reduce((s, v) => s + Math.abs(v - dataMean), 0) / values.length;
        assert.ok(Math.abs(problem.answer - expected) < 0.01, `[${difficulty}] seed ${seed}: MAD matches the direct calculation`);
        assert.ok(problem.answer >= 0, `[${difficulty}] seed ${seed}: MAD is never negative`);
      }
    }
  });

  QUnit.test('readDotPlot: the answer always matches a direct count over the underlying values, and carries a dotPlot visual', (assert) => {
    const gen = byId['grade6.statistics.readDotPlot'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 100; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const { values, question, targetValue } = problem.meta;
        assert.equal(problem.visual.type, 'dotPlot', `[${difficulty}] seed ${seed}: visual type`);
        assert.deepEqual(problem.visual.values, values, `[${difficulty}] seed ${seed}: visual shows the actual data`);
        if (question === 'frequency') {
          const expected = values.filter((v) => v === targetValue).length;
          assert.equal(problem.answer, expected, `[${difficulty}] seed ${seed}: frequency count`);
        } else if (question === 'total') {
          assert.equal(problem.answer, values.length, `[${difficulty}] seed ${seed}: total count`);
        } else {
          const counts = new Map();
          for (const v of values) counts.set(v, (counts.get(v) || 0) + 1);
          const maxCount = Math.max(...counts.values());
          const modeCandidates = Array.from(counts.entries()).filter(([, c]) => c === maxCount);
          assert.equal(modeCandidates.length, 1, `[${difficulty}] seed ${seed}: mode is only asked when unambiguous`);
          assert.equal(problem.answer, modeCandidates[0][0], `[${difficulty}] seed ${seed}: mode value`);
        }
      }
    }
  });

  QUnit.test('readHistogram: the answer always matches the actual bins, and "most frequent" is only asked when unambiguous', (assert) => {
    const gen = byId['grade6.statistics.readHistogram'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 100; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const { bins, question, targetBin } = problem.meta;
        assert.equal(problem.visual.type, 'histogram', `[${difficulty}] seed ${seed}: visual type`);
        if (question === 'binCount') {
          assert.equal(problem.answer, targetBin.count, `[${difficulty}] seed ${seed}: bin count`);
        } else if (question === 'total') {
          assert.equal(
            problem.answer,
            bins.reduce((s, b) => s + b.count, 0),
            `[${difficulty}] seed ${seed}: total count`
          );
        } else {
          const maxCount = Math.max(...bins.map((b) => b.count));
          const topBins = bins.filter((b) => b.count === maxCount);
          assert.equal(topBins.length, 1, `[${difficulty}] seed ${seed}: most-frequent bin is only asked when unambiguous`);
          assert.equal(problem.answerDisplay, `${topBins[0].min}-${topBins[0].max}`, `[${difficulty}] seed ${seed}: identifies the tallest bin`);
          assert.ok(problem.checkAnswer(`${topBins[0].min} to ${topBins[0].max}`), `[${difficulty}] seed ${seed}: accepts alternate interval phrasing`);
        }
      }
    }
  });

  QUnit.test('readBoxPlot: the five-number summary is strictly increasing, and every answer matches it exactly', (assert) => {
    const gen = byId['grade6.statistics.readBoxPlot'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 100; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const { min, q1, median, q3, max, question } = problem.meta;
        assert.ok(min < q1 && q1 < median && median < q3 && q3 < max, `[${difficulty}] seed ${seed}: strictly increasing five-number summary`);
        assert.equal(problem.visual.type, 'boxPlot', `[${difficulty}] seed ${seed}: visual type`);
        const expectedByQuestion = { median, range: max - min, iqr: q3 - q1, min, max };
        assert.equal(problem.answer, expectedByQuestion[question], `[${difficulty}] seed ${seed}: ${question}`);
      }
    }
  });
});
