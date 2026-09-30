import { randomInt, randomChoice, shuffle } from '../../core/rng.js';
import { numericCheckAnswer, roundTo, reduceFraction, formatMixedNumber, mulFractions, fractionCheckAnswer } from '../../core/problemGenerator.js';

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
      const answerDisplay = `${answer} square units`;
      return {
        promptText: `What is the area of a rectangle with length ${length} and width ${width}?`,
        answer,
        answerDisplay,
        checkAnswer: numericCheckAnswer(answer, 0.01),
        meta: { generatorId: areaRectangleTriangle.id, difficulty, shape, length, width, answerDisplay },
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
    const answerDisplay = `${answer} square units`;
    return {
      promptText: `What is the area of a triangle with base ${base} and height ${height}?`,
      answer,
      answerDisplay,
      checkAnswer: numericCheckAnswer(answer, 0.01),
      meta: { generatorId: areaRectangleTriangle.id, difficulty, shape, base, height, answerDisplay },
    };
  },
  explain(meta) {
    const { shape, answerDisplay } = meta;
    if (shape === 'rectangle') {
      const { length, width } = meta;
      return {
        strategy: ['The area of a rectangle is length times width.'],
        workedSteps: [`Area = length × width = ${length} × ${width} = ${answerDisplay}.`],
        finalAnswerDisplay: answerDisplay,
      };
    }
    const { base, height } = meta;
    return {
      strategy: ['The area of a triangle is one-half times base times height.'],
      workedSteps: [
        `Area = ½ × base × height = ½ × ${base} × ${height}.`,
        `${base} × ${height} = ${base * height}, then ÷ 2 = ${answerDisplay}.`,
      ],
      finalAnswerDisplay: answerDisplay,
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
    const answerDisplay = `${answer} square units`;
    return {
      promptText: `What is the area of a parallelogram with base ${base} and height ${height}?`,
      answer,
      answerDisplay,
      checkAnswer: numericCheckAnswer(answer, 0.01),
      meta: { generatorId: areaParallelogram.id, difficulty, base, height, answerDisplay },
    };
  },
  explain(meta) {
    const { base, height, answerDisplay } = meta;
    return {
      strategy: ['The area of a parallelogram is base times height.'],
      workedSteps: [`Area = base × height = ${base} × ${height} = ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
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
    const answerDisplay = `${answer} cubic units`;
    return {
      promptText: `What is the volume of a rectangular prism with length ${length}, width ${width}, and height ${height}?`,
      answer,
      answerDisplay,
      checkAnswer: numericCheckAnswer(answer, 0.05),
      meta: { generatorId: volumeRectangularPrism.id, difficulty, length, width, height, answerDisplay },
    };
  },
  explain(meta) {
    const { length, width, height, answerDisplay } = meta;
    return {
      strategy: ['The volume of a rectangular prism is length times width times height.'],
      workedSteps: [`Volume = length × width × height = ${length} × ${width} × ${height} = ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
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
    const answerDisplay = `${answer} square units`;
    return {
      promptText: `What is the surface area of a rectangular prism with length ${length}, width ${width}, and height ${height}?`,
      answer,
      answerDisplay,
      checkAnswer: numericCheckAnswer(answer, 0.05),
      meta: { generatorId: surfaceAreaRectangularPrism.id, difficulty, length, width, height, answerDisplay },
    };
  },
  explain(meta) {
    const { length, width, height, answerDisplay } = meta;
    const lw = roundTo(length * width, 2);
    const lh = roundTo(length * height, 2);
    const wh = roundTo(width * height, 2);
    const sumOfFaces = roundTo(lw + lh + wh, 2);
    return {
      strategy: [
        'A rectangular prism has 3 pairs of matching faces: top/bottom, front/back, and left/right.',
        'Find the area of each of the 3 different faces, add them together, then double the total.',
      ],
      workedSteps: [
        `Find the area of each face: length×width = ${lw}, length×height = ${lh}, width×height = ${wh}.`,
        `Add them: ${lw} + ${lh} + ${wh} = ${sumOfFaces}.`,
        `Double it (for the matching faces on the other side): 2 × ${sumOfFaces} = ${answerDisplay}.`,
      ],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Composite area (composing/decomposing shapes) ---------------------------

const compositeArea = {
  id: 'grade6.areaSurfaceVolume.compositeArea',
  grade: GRADE,
  topic: TOPIC,
  label: 'Composite Area (Decomposing Shapes)',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const range = difficulty === 'easy' ? { min: 6, max: 14 } : difficulty === 'medium' ? { min: 8, max: 20 } : { min: 10, max: 28 };
    const bigWidth = randomInt(rng, range.min, range.max);
    const bigHeight = randomInt(rng, range.min, range.max);
    const cutWidth = randomInt(rng, 2, Math.max(2, Math.floor(bigWidth / 2)));
    const cutHeight = randomInt(rng, 2, Math.max(2, Math.floor(bigHeight / 2)));
    const bigArea = bigWidth * bigHeight;
    const cutArea = cutWidth * cutHeight;
    const answer = bigArea - cutArea;
    const answerDisplay = `${answer} square units`;
    return {
      promptText: `A rectangular region measures ${bigWidth} by ${bigHeight}. A rectangular piece ${cutWidth} by ${cutHeight} is removed from one corner. What is the area of the remaining region?`,
      answer,
      answerDisplay,
      checkAnswer: numericCheckAnswer(answer, 0.01),
      meta: { generatorId: compositeArea.id, difficulty, bigWidth, bigHeight, cutWidth, cutHeight, answerDisplay },
    };
  },
  explain(meta) {
    const { bigWidth, bigHeight, cutWidth, cutHeight, answerDisplay } = meta;
    const bigArea = bigWidth * bigHeight;
    const cutArea = cutWidth * cutHeight;
    return {
      strategy: [
        'Find the area of the whole large rectangle.',
        'Find the area of the piece that was removed.',
        'Subtract the removed piece from the whole.',
      ],
      workedSteps: [
        `Area of the whole region: ${bigWidth} × ${bigHeight} = ${bigArea}.`,
        `Area of the removed piece: ${cutWidth} × ${cutHeight} = ${cutArea}.`,
        `Subtract: ${bigArea} − ${cutArea} = ${answerDisplay}.`,
      ],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Trapezoid area ------------------------------------------------------------

const trapezoidArea = {
  id: 'grade6.areaSurfaceVolume.trapezoidArea',
  grade: GRADE,
  topic: TOPIC,
  label: 'Area of Trapezoids',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const range = difficulty === 'easy' ? { min: 3, max: 12 } : difficulty === 'medium' ? { min: 4, max: 18 } : { min: 4, max: 24 };
    const allowDecimal = difficulty === 'hard';
    const b1 = randomDimension(rng, { ...range, allowDecimal: false });
    const b2 = randomDimension(rng, { ...range, allowDecimal: false });
    let h = randomDimension(rng, { ...range, allowDecimal: false });
    if (((b1 + b2) * h) % 2 !== 0) h += 1;
    if (allowDecimal && randomChoice(rng, [true, false])) {
      h = randomDimension(rng, { ...range, allowDecimal: true });
    }
    const answer = roundTo(((b1 + b2) * h) / 2, 2);
    const answerDisplay = `${answer} square units`;
    return {
      promptText: `What is the area of a trapezoid with parallel sides ${b1} and ${b2}, and height ${h}?`,
      answer,
      answerDisplay,
      checkAnswer: numericCheckAnswer(answer, 0.01),
      meta: { generatorId: trapezoidArea.id, difficulty, b1, b2, h, answerDisplay },
    };
  },
  explain(meta) {
    const { b1, b2, h, answerDisplay } = meta;
    const sum = roundTo(b1 + b2, 2);
    const product = roundTo(sum * h, 2);
    return {
      strategy: ['Add the two parallel sides together.', 'Multiply by the height.', 'Divide by 2.'],
      workedSteps: [
        `Add the parallel sides: ${b1} + ${b2} = ${sum}.`,
        `Multiply by the height: ${sum} × ${h} = ${product}.`,
        `Divide by 2: ${product} ÷ 2 = ${answerDisplay}.`,
      ],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Volume with fractional edge lengths --------------------------------------

function randomFractionalEdge(rng, difficulty) {
  const whole = randomInt(rng, 1, difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8);
  const den = randomChoice(rng, [2, 4]);
  const num = randomInt(rng, 1, den - 1);
  return reduceFraction(whole * den + num, den);
}

function randomWholeEdge(rng, difficulty) {
  return { num: randomInt(rng, 2, difficulty === 'easy' ? 6 : difficulty === 'medium' ? 10 : 12), den: 1 };
}

function edgeDisplay(edge) {
  return edge.den === 1 ? `${edge.num}` : formatMixedNumber(edge);
}

const volumeFractionalEdges = {
  id: 'grade6.areaSurfaceVolume.volumeFractionalEdges',
  grade: GRADE,
  topic: TOPIC,
  label: 'Volume with Fractional Edge Lengths',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const fractionalCount = difficulty === 'hard' ? randomChoice(rng, [2, 3]) : 1;
    const dims = ['length', 'width', 'height'];
    const fractionalDims = new Set(shuffle(rng, dims).slice(0, fractionalCount));

    const edges = {};
    for (const dim of dims) {
      edges[dim] = fractionalDims.has(dim) ? randomFractionalEdge(rng, difficulty) : randomWholeEdge(rng, difficulty);
    }

    const volume = mulFractions(mulFractions(edges.length, edges.width), edges.height);
    const answerDisplay = formatMixedNumber(volume);
    return {
      promptText: `What is the volume of a rectangular prism with length ${edgeDisplay(edges.length)}, width ${edgeDisplay(edges.width)}, and height ${edgeDisplay(edges.height)}?`,
      answer: volume,
      answerDisplay,
      checkAnswer: fractionCheckAnswer(volume),
      meta: { generatorId: volumeFractionalEdges.id, difficulty, length: edges.length, width: edges.width, height: edges.height, answerDisplay },
    };
  },
  explain(meta) {
    const { length, width, height, answerDisplay } = meta;
    const lw = mulFractions(length, width);
    return {
      strategy: ['Multiply length × width × height, just like with whole numbers — multiply the fractions straight across.', 'Simplify the result.'],
      workedSteps: [
        `Multiply length × width: ${edgeDisplay(length)} × ${edgeDisplay(width)} = ${formatMixedNumber(lw)}.`,
        `Multiply that by the height: ${formatMixedNumber(lw)} × ${edgeDisplay(height)} = ${answerDisplay}.`,
      ],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

export const generators = [
  areaRectangleTriangle,
  areaParallelogram,
  volumeRectangularPrism,
  surfaceAreaRectangularPrism,
  compositeArea,
  trapezoidArea,
  volumeFractionalEdges,
];
