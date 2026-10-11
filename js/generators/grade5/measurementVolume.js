// 5.MD: converting measurement units within a system, and volume of
// rectangular prisms (including composite solids).
import { randomInt, randomChoice } from '../../core/rng.js';
import { numericCheckAnswer } from '../../core/problemGenerator.js';

const GRADE = '5';
const TOPIC = 'measurementVolume';

// --- Converting measurement units (5.MD.A.1) ------------------------------------

const CONVERSIONS = [
  { from: 'cm', to: 'mm', factor: 10 },
  { from: 'm', to: 'cm', factor: 100 },
  { from: 'km', to: 'm', factor: 1000 },
  { from: 'kg', to: 'g', factor: 1000 },
  { from: 'g', to: 'mg', factor: 1000 },
  { from: 'L', to: 'mL', factor: 1000 },
  { from: 'ft', to: 'in', factor: 12 },
  { from: 'yd', to: 'ft', factor: 3 },
  { from: 'lb', to: 'oz', factor: 16 },
  { from: 'gal', to: 'qt', factor: 4 },
];

const convertMeasurementUnits = {
  id: 'grade5.measurementVolume.convertMeasurementUnits',
  grade: GRADE,
  topic: TOPIC,
  label: 'Converting Measurement Units',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const conv = randomChoice(rng, CONVERSIONS);
    const direction = difficulty === 'hard' ? randomChoice(rng, ['toSmall', 'toBig']) : 'toSmall';
    const maxValue = difficulty === 'easy' ? 12 : difficulty === 'medium' ? 25 : 40;

    if (direction === 'toSmall') {
      const promptValue = randomInt(rng, 1, maxValue);
      const answer = promptValue * conv.factor;
      const answerDisplay = `${answer} ${conv.to}`;
      return {
        promptText: `Convert ${promptValue} ${conv.from} to ${conv.to}.`,
        answer,
        answerDisplay,
        checkAnswer: numericCheckAnswer(answer, 1e-9),
        meta: { generatorId: convertMeasurementUnits.id, difficulty, unitFrom: conv.from, unitTo: conv.to, factor: conv.factor, direction, promptValue, answerDisplay },
      };
    }
    const multiple = randomInt(rng, 1, maxValue);
    const promptValue = multiple * conv.factor;
    const answer = multiple;
    const answerDisplay = `${answer} ${conv.from}`;
    return {
      promptText: `Convert ${promptValue} ${conv.to} to ${conv.from}.`,
      answer,
      answerDisplay,
      checkAnswer: numericCheckAnswer(answer, 1e-9),
      meta: { generatorId: convertMeasurementUnits.id, difficulty, unitFrom: conv.from, unitTo: conv.to, factor: conv.factor, direction, promptValue, answerDisplay },
    };
  },
  explain(meta) {
    const { unitFrom, unitTo, factor, direction, promptValue, answerDisplay } = meta;
    if (direction === 'toSmall') {
      return {
        strategy: [`1 ${unitFrom} = ${factor} ${unitTo}.`, 'To convert to a smaller unit, multiply.'],
        workedSteps: [`${promptValue} × ${factor} = ${answerDisplay}.`],
        finalAnswerDisplay: answerDisplay,
      };
    }
    return {
      strategy: [`1 ${unitFrom} = ${factor} ${unitTo}.`, 'To convert to a bigger unit, divide.'],
      workedSteps: [`${promptValue} ÷ ${factor} = ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Volume of a rectangular prism (5.MD.C.3-5) ---------------------------------

const volumeRectangularPrism = {
  id: 'grade5.measurementVolume.volumeRectangularPrism',
  grade: GRADE,
  topic: TOPIC,
  label: 'Volume of Rectangular Prisms',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const range = difficulty === 'easy' ? { min: 2, max: 6 } : difficulty === 'medium' ? { min: 2, max: 9 } : { min: 2, max: 12 };
    const length = randomInt(rng, range.min, range.max);
    const width = randomInt(rng, range.min, range.max);
    const height = randomInt(rng, range.min, range.max);
    const answer = length * width * height;
    const answerDisplay = `${answer} cubic units`;
    return {
      promptText: `A rectangular prism is built from unit cubes. It is ${length} units long, ${width} units wide, and ${height} units tall. What is its volume?`,
      answer,
      answerDisplay,
      checkAnswer: numericCheckAnswer(answer, 1e-9),
      meta: { generatorId: volumeRectangularPrism.id, difficulty, length, width, height, answerDisplay },
    };
  },
  explain(meta) {
    const { length, width, height, answerDisplay } = meta;
    return {
      strategy: ['Volume of a rectangular prism = length × width × height.', 'This also tells you how many unit cubes it takes to fill the shape.'],
      workedSteps: [`Volume = ${length} × ${width} × ${height} = ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Composite volume (5.MD.C.5c) -----------------------------------------------

const compositeVolume = {
  id: 'grade5.measurementVolume.compositeVolume',
  grade: GRADE,
  topic: TOPIC,
  label: 'Volume of Composite Solids',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const range = difficulty === 'easy' ? { min: 2, max: 5 } : difficulty === 'medium' ? { min: 2, max: 7 } : { min: 2, max: 9 };
    const dims1 = [randomInt(rng, range.min, range.max), randomInt(rng, range.min, range.max), randomInt(rng, range.min, range.max)];
    const dims2 = [randomInt(rng, range.min, range.max), randomInt(rng, range.min, range.max), randomInt(rng, range.min, range.max)];
    const vol1 = dims1[0] * dims1[1] * dims1[2];
    const vol2 = dims2[0] * dims2[1] * dims2[2];
    const answer = vol1 + vol2;
    const answerDisplay = `${answer} cubic units`;
    return {
      promptText: `A solid is made of two rectangular prisms stuck together. One is ${dims1[0]} × ${dims1[1]} × ${dims1[2]}, and the other is ${dims2[0]} × ${dims2[1]} × ${dims2[2]}. What is the total volume?`,
      answer,
      answerDisplay,
      checkAnswer: numericCheckAnswer(answer, 1e-9),
      meta: { generatorId: compositeVolume.id, difficulty, dims1, dims2, vol1, vol2, answerDisplay },
    };
  },
  explain(meta) {
    const { dims1, dims2, vol1, vol2, answerDisplay } = meta;
    return {
      strategy: ['Find the volume of each rectangular prism separately.', 'Add the two volumes together.'],
      workedSteps: [`First prism: ${dims1[0]} × ${dims1[1]} × ${dims1[2]} = ${vol1}.`, `Second prism: ${dims2[0]} × ${dims2[1]} × ${dims2[2]} = ${vol2}.`, `Total volume: ${vol1} + ${vol2} = ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

export const generators = [convertMeasurementUnits, volumeRectangularPrism, compositeVolume];
