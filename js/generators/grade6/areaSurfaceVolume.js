import { randomInt, randomChoice } from '../../core/rng.js';
import { numericCheckAnswer, roundTo } from '../../core/problemGenerator.js';

const GRADE = '6';
const TOPIC = 'areaSurfaceVolume';

/** A random dimension; at "hard" difficulty, sometimes a one-decimal-place value. */
function randomDimension(rng, { min, max, allowDecimal }) {
  if (allowDecimal && randomChoice(rng, [true, false])) {
    return roundTo(randomInt(rng, min * 10, max * 10) / 10, 1);
  }
  return randomInt(rng, min, max);
}

const areaRectangleTriangle = {
  id: 'grade6.areaSurfaceVolume.areaRectangleTriangle',
  grade: GRADE,
  topic: TOPIC,
  label: 'Area of Rectangles & Triangles',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const range = difficulty === 'easy' ? { min: 2, max: 12 } : difficulty === 'medium' ? { min: 3, max: 20 } : { min: 3, max: 25 };
    const allowDecimal = difficulty === 'hard';
    const shape = randomChoice(rng, ['rectangle', 'triangle']);

    if (shape === 'rectangle') {
      const length = randomDimension(rng, { ...range, allowDecimal });
      const width = randomDimension(rng, { ...range, allowDecimal });
      const answer = roundTo(length * width, 2);
      return {
        promptText: `What is the area of a rectangle with length ${length} and width ${width}?`,
        answer,
        answerDisplay: `${answer} square units`,
        checkAnswer: numericCheckAnswer(answer, 0.01),
        meta: { generatorId: areaRectangleTriangle.id, difficulty },
      };
    }

    // Ensure an integer area at easy/medium by making base*height even.
    let base = randomDimension(rng, { ...range, allowDecimal: false });
    let height = randomDimension(rng, { ...range, allowDecimal: false });
    if (!allowDecimal && (base * height) % 2 !== 0) height += 1;
    if (allowDecimal && randomChoice(rng, [true, false])) {
      base = randomDimension(rng, { ...range, allowDecimal: true });
    }
    const answer = roundTo((base * height) / 2, 2);
    return {
      promptText: `What is the area of a triangle with base ${base} and height ${height}?`,
      answer,
      answerDisplay: `${answer} square units`,
      checkAnswer: numericCheckAnswer(answer, 0.01),
      meta: { generatorId: areaRectangleTriangle.id, difficulty },
    };
  },
};

const areaParallelogram = {
  id: 'grade6.areaSurfaceVolume.areaParallelogram',
  grade: GRADE,
  topic: TOPIC,
  label: 'Area of Parallelograms',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const range = difficulty === 'easy' ? { min: 2, max: 12 } : difficulty === 'medium' ? { min: 3, max: 20 } : { min: 3, max: 25 };
    const allowDecimal = difficulty === 'hard';
    const base = randomDimension(rng, { ...range, allowDecimal });
    const height = randomDimension(rng, { ...range, allowDecimal });
    const answer = roundTo(base * height, 2);
    return {
      promptText: `What is the area of a parallelogram with base ${base} and height ${height}?`,
      answer,
      answerDisplay: `${answer} square units`,
      checkAnswer: numericCheckAnswer(answer, 0.01),
      meta: { generatorId: areaParallelogram.id, difficulty },
    };
  },
};

const volumeRectangularPrism = {
  id: 'grade6.areaSurfaceVolume.volumeRectangularPrism',
  grade: GRADE,
  topic: TOPIC,
  label: 'Volume of Rectangular Prisms',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const range = difficulty === 'easy' ? { min: 2, max: 8 } : difficulty === 'medium' ? { min: 2, max: 12 } : { min: 2, max: 15 };
    const allowDecimal = difficulty === 'hard';
    const length = randomDimension(rng, { ...range, allowDecimal });
    const width = randomDimension(rng, { ...range, allowDecimal });
    const height = randomDimension(rng, { ...range, allowDecimal });
    const answer = roundTo(length * width * height, 2);
    return {
      promptText: `What is the volume of a rectangular prism with length ${length}, width ${width}, and height ${height}?`,
      answer,
      answerDisplay: `${answer} cubic units`,
      checkAnswer: numericCheckAnswer(answer, 0.05),
      meta: { generatorId: volumeRectangularPrism.id, difficulty },
    };
  },
};

const surfaceAreaRectangularPrism = {
  id: 'grade6.areaSurfaceVolume.surfaceAreaRectangularPrism',
  grade: GRADE,
  topic: TOPIC,
  label: 'Surface Area of Rectangular Prisms',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const range = difficulty === 'easy' ? { min: 2, max: 8 } : difficulty === 'medium' ? { min: 2, max: 12 } : { min: 2, max: 15 };
    const allowDecimal = difficulty === 'hard';
    const length = randomDimension(rng, { ...range, allowDecimal });
    const width = randomDimension(rng, { ...range, allowDecimal });
    const height = randomDimension(rng, { ...range, allowDecimal });
    const answer = roundTo(2 * (length * width + length * height + width * height), 2);
    return {
      promptText: `What is the surface area of a rectangular prism with length ${length}, width ${width}, and height ${height}?`,
      answer,
      answerDisplay: `${answer} square units`,
      checkAnswer: numericCheckAnswer(answer, 0.05),
      meta: { generatorId: surfaceAreaRectangularPrism.id, difficulty },
    };
  },
};

export const generators = [areaRectangleTriangle, areaParallelogram, volumeRectangularPrism, surfaceAreaRectangularPrism];
