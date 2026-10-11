// 5.G.A: the coordinate plane, restricted to the first quadrant (unlike grade
// 6, which covers all four). Reuses js/charts/coordinatePlane.js with its
// `quadrant1` flag. Deliberately shares the "coordinatePlane" topic key with
// the grade-6 module — same concept, same display label, scoped per grade.
import { randomInt } from '../../core/rng.js';
import { numericCheckAnswer } from '../../core/problemGenerator.js';

const GRADE = '5';
const TOPIC = 'coordinatePlane';

/** Accepts "(3, 2)", "3,2", "3, 2", etc. */
function coordinateCheckAnswer(x, y) {
  return (userInput) => {
    if (typeof userInput !== 'string') return false;
    const match = /^\(?\s*(\d+)\s*,\s*(\d+)\s*\)?$/.exec(userInput.trim());
    if (!match) return false;
    return Number(match[1]) === x && Number(match[2]) === y;
  };
}

// --- Identifying coordinates ----------------------------------------------------

const identifyCoordinates = {
  id: 'grade5.coordinatePlane.identifyCoordinates',
  grade: GRADE,
  topic: TOPIC,
  label: 'Identifying Coordinates',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const range = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 8 : 10;
    const x = randomInt(rng, 1, range);
    const y = randomInt(rng, 1, range);
    const answerDisplay = `(${x}, ${y})`;
    return {
      promptText: 'What are the coordinates of point A on the grid?',
      answer: [x, y],
      answerDisplay,
      checkAnswer: coordinateCheckAnswer(x, y),
      meta: { generatorId: identifyCoordinates.id, difficulty, x, y, answerDisplay },
      visual: { type: 'coordinatePlane', range, quadrant1: true, points: [{ x, y, label: 'A' }] },
    };
  },
  explain(meta) {
    const { x, y, answerDisplay } = meta;
    return {
      strategy: ['The x-coordinate tells how far right of the origin (along the x-axis) the point is.', 'The y-coordinate tells how far up from the origin (along the y-axis) the point is.'],
      workedSteps: [`Point A is ${x} unit(s) right of the origin, so x = ${x}.`, `Point A is ${y} unit(s) up from the origin, so y = ${y}.`, `The coordinates are ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Plotting a point (interactive) ----------------------------------------------

const plotPoint = {
  id: 'grade5.coordinatePlane.plotPoint',
  grade: GRADE,
  topic: TOPIC,
  label: 'Plotting Points',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const range = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 8 : 10;
    const x = randomInt(rng, 1, range);
    const y = randomInt(rng, 1, range);
    const answerDisplay = `(${x}, ${y})`;
    return {
      promptText: `Plot the point ${answerDisplay} on the grid.`,
      answer: [x, y],
      answerDisplay,
      checkAnswer: coordinateCheckAnswer(x, y),
      meta: { generatorId: plotPoint.id, difficulty, x, y, answerDisplay },
      visual: {
        type: 'coordinatePlane',
        range,
        quadrant1: true,
        interactive: true,
        answerVisual: { type: 'coordinatePlane', range, quadrant1: true, points: [{ x, y, label: 'Answer' }] },
      },
    };
  },
  explain(meta) {
    const { x, y, answerDisplay } = meta;
    return {
      strategy: ['Start at the origin (0, 0).', 'Move right along the x-axis for the x-coordinate.', 'Then move up for the y-coordinate.'],
      workedSteps: [`From the origin, move ${x} unit(s) right.`, `Then move ${y} unit(s) up.`, `That's the point ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

export const generators = [identifyCoordinates, plotPoint];
