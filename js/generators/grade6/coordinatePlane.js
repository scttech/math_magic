// The Coordinate Plane: identifying/plotting points, reflections, distance
// between points sharing a coordinate, quadrants, and polygon side lengths
// (6.NS.C.6, 6.NS.C.8, 6.G.A.3). Unlike every other grade-6 topic, these
// problems carry a `visual` field describing a coordinate grid to render
// (see js/charts/coordinatePlane.js) — quizView.js and worksheetView.js both
// know how to mount one. `plotPoint` is the one interactive problem type: the
// student clicks the grid instead of typing, and the click (snapped to the
// nearest integer) is formatted the same way as a typed answer so checkAnswer
// stays a plain string-in, boolean-out function like every other generator's.
import { randomInt, randomChoice } from '../../core/rng.js';
import { numericCheckAnswer } from '../../core/problemGenerator.js';

const GRADE = '6';
const TOPIC = 'coordinatePlane';

function randomNonZeroInt(rng, min, max) {
  let value = 0;
  while (value === 0) value = randomInt(rng, min, max);
  return value;
}

/** Accepts "(3, -2)", "3,-2", "3, -2", etc. */
function coordinateCheckAnswer(x, y) {
  return (userInput) => {
    if (typeof userInput !== 'string') return false;
    const match = /^\(?\s*(-?\d+)\s*,\s*(-?\d+)\s*\)?$/.exec(userInput.trim());
    if (!match) return false;
    return Number(match[1]) === x && Number(match[2]) === y;
  };
}

const ROMAN_TO_NUMBER = { I: '1', II: '2', III: '3', IV: '4' };

function quadrantCheckAnswer(quadrant) {
  const number = ROMAN_TO_NUMBER[quadrant];
  return (userInput) => {
    if (typeof userInput !== 'string') return false;
    const cleaned = userInput.trim().toLowerCase().replace(/^quadrant\s*/, '');
    return cleaned === quadrant.toLowerCase() || cleaned === number;
  };
}

function quadrantOf(x, y) {
  if (x > 0 && y > 0) return 'I';
  if (x < 0 && y > 0) return 'II';
  if (x < 0 && y < 0) return 'III';
  return 'IV';
}

// --- Identifying coordinates -------------------------------------------------

const identifyCoordinates = {
  id: 'grade6.coordinatePlane.identifyCoordinates',
  grade: GRADE,
  topic: TOPIC,
  label: 'Identifying Coordinates',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const range = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 7 : 10;
    const x = randomNonZeroInt(rng, -range, range);
    const y = randomNonZeroInt(rng, -range, range);
    const answerDisplay = `(${x}, ${y})`;
    return {
      promptText: 'What are the coordinates of point A on the grid?',
      answer: [x, y],
      answerDisplay,
      checkAnswer: coordinateCheckAnswer(x, y),
      meta: { generatorId: identifyCoordinates.id, difficulty, x, y, answerDisplay },
      visual: { range, points: [{ x, y, label: 'A' }] },
    };
  },
  explain(meta) {
    const { x, y, answerDisplay } = meta;
    return {
      strategy: [
        'Read the x-coordinate: how far left or right of the origin the point is.',
        'Read the y-coordinate: how far up or down from the origin the point is.',
      ],
      workedSteps: [
        `Point A is ${Math.abs(x)} unit(s) ${x >= 0 ? 'right' : 'left'} of the origin, so x = ${x}.`,
        `Point A is ${Math.abs(y)} unit(s) ${y >= 0 ? 'up' : 'down'} from the origin, so y = ${y}.`,
        `The coordinates are ${answerDisplay}.`,
      ],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Reflecting a point --------------------------------------------------------

const reflectPoint = {
  id: 'grade6.coordinatePlane.reflectPoint',
  grade: GRADE,
  topic: TOPIC,
  label: 'Reflecting Points',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const range = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 7 : 10;
    const x = randomNonZeroInt(rng, -range, range);
    const y = randomNonZeroInt(rng, -range, range);
    const axis = randomChoice(rng, ['x-axis', 'y-axis']);
    const rx = axis === 'x-axis' ? x : -x;
    const ry = axis === 'x-axis' ? -y : y;
    const answerDisplay = `(${rx}, ${ry})`;
    return {
      promptText: `Point A is at (${x}, ${y}). What are its coordinates after reflecting across the ${axis}?`,
      answer: [rx, ry],
      answerDisplay,
      checkAnswer: coordinateCheckAnswer(rx, ry),
      meta: { generatorId: reflectPoint.id, difficulty, x, y, axis, answerDisplay },
      visual: { range, points: [{ x, y, label: 'A' }] },
    };
  },
  explain(meta) {
    const { x, y, axis, answerDisplay } = meta;
    if (axis === 'x-axis') {
      return {
        strategy: ['Reflecting across the x-axis keeps x the same and flips the sign of y.'],
        workedSteps: [`x stays ${x}.`, `y flips sign: ${y} becomes ${-y}.`, `The reflected point is ${answerDisplay}.`],
        finalAnswerDisplay: answerDisplay,
      };
    }
    return {
      strategy: ['Reflecting across the y-axis keeps y the same and flips the sign of x.'],
      workedSteps: [`y stays ${y}.`, `x flips sign: ${x} becomes ${-x}.`, `The reflected point is ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Distance between two points sharing a coordinate --------------------------

const distanceBetweenPoints = {
  id: 'grade6.coordinatePlane.distanceBetweenPoints',
  grade: GRADE,
  topic: TOPIC,
  label: 'Distance Between Points',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const range = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 7 : 10;
    const sameAxis = randomChoice(rng, ['x', 'y']);

    let ax;
    let ay;
    let bx;
    let by;
    if (sameAxis === 'x') {
      ax = randomNonZeroInt(rng, -range, range);
      bx = ax;
      ay = randomNonZeroInt(rng, -range, range);
      by = ay;
      while (by === ay) by = randomNonZeroInt(rng, -range, range);
    } else {
      ay = randomNonZeroInt(rng, -range, range);
      by = ay;
      ax = randomNonZeroInt(rng, -range, range);
      bx = ax;
      while (bx === ax) bx = randomNonZeroInt(rng, -range, range);
    }
    const distance = sameAxis === 'x' ? Math.abs(by - ay) : Math.abs(bx - ax);
    const answerDisplay = `${distance}`;
    return {
      promptText: 'What is the distance between point A and point B?',
      answer: distance,
      answerDisplay,
      checkAnswer: numericCheckAnswer(distance, 1e-9),
      meta: { generatorId: distanceBetweenPoints.id, difficulty, ax, ay, bx, by, sameAxis, answerDisplay },
      visual: {
        range,
        points: [
          { x: ax, y: ay, label: 'A' },
          { x: bx, y: by, label: 'B' },
        ],
        segment: [
          { x: ax, y: ay },
          { x: bx, y: by },
        ],
      },
    };
  },
  explain(meta) {
    const { ax, ay, bx, by, sameAxis, answerDisplay } = meta;
    if (sameAxis === 'x') {
      return {
        strategy: ['When two points share the same x-coordinate, the distance between them is the difference of their y-coordinates.'],
        workedSteps: [`Both points have x = ${ax}.`, `Distance = |${by} − ${ay}| = ${answerDisplay}.`],
        finalAnswerDisplay: answerDisplay,
      };
    }
    return {
      strategy: ['When two points share the same y-coordinate, the distance between them is the difference of their x-coordinates.'],
      workedSteps: [`Both points have y = ${ay}.`, `Distance = |${bx} − ${ax}| = ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Identifying a quadrant -----------------------------------------------------

const identifyQuadrant = {
  id: 'grade6.coordinatePlane.identifyQuadrant',
  grade: GRADE,
  topic: TOPIC,
  label: 'Identifying Quadrants',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const range = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 7 : 10;
    const x = randomNonZeroInt(rng, -range, range);
    const y = randomNonZeroInt(rng, -range, range);
    const quadrant = quadrantOf(x, y);
    const answerDisplay = `Quadrant ${quadrant}`;
    return {
      promptText: `In which quadrant is the point (${x}, ${y}) located?`,
      answer: quadrant,
      answerDisplay,
      checkAnswer: quadrantCheckAnswer(quadrant),
      meta: { generatorId: identifyQuadrant.id, difficulty, x, y, quadrant, answerDisplay },
      visual: { range, points: [{ x, y }] },
    };
  },
  explain(meta) {
    const { x, y, answerDisplay } = meta;
    return {
      strategy: [
        'Quadrant I: x positive, y positive.',
        'Quadrant II: x negative, y positive.',
        'Quadrant III: x negative, y negative.',
        'Quadrant IV: x positive, y negative.',
      ],
      workedSteps: [`(${x}, ${y}): x is ${x > 0 ? 'positive' : 'negative'} and y is ${y > 0 ? 'positive' : 'negative'}.`, `That's ${answerDisplay}.`],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Polygon side length ---------------------------------------------------------

const polygonSideLength = {
  id: 'grade6.coordinatePlane.polygonSideLength',
  grade: GRADE,
  topic: TOPIC,
  label: 'Polygon Side Lengths on the Coordinate Plane',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const range = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 8 : 11;
    const maxSide = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 7;
    const width = randomInt(rng, 2, maxSide);
    const height = randomInt(rng, 2, maxSide);
    const x0 = randomInt(rng, -range, range - width);
    const y0 = randomInt(rng, -range, range - height);
    const vertices = [
      { x: x0, y: y0, label: 'A' },
      { x: x0 + width, y: y0, label: 'B' },
      { x: x0 + width, y: y0 + height, label: 'C' },
      { x: x0, y: y0 + height, label: 'D' },
    ];
    const sideChoice = randomChoice(rng, ['AB', 'BC']);
    const answer = sideChoice === 'AB' ? width : height;
    const answerDisplay = `${answer}`;
    return {
      promptText: `Rectangle ABCD is graphed on the coordinate plane. What is the length of side ${sideChoice}?`,
      answer,
      answerDisplay,
      checkAnswer: numericCheckAnswer(answer, 1e-9),
      meta: { generatorId: polygonSideLength.id, difficulty, vertices, sideChoice, answerDisplay },
      visual: { range, polygon: vertices },
    };
  },
  explain(meta) {
    const { vertices, sideChoice, answerDisplay } = meta;
    const byLabel = Object.fromEntries(vertices.map((v) => [v.label, v]));
    const [label1, label2] = sideChoice.split('');
    const p1 = byLabel[label1];
    const p2 = byLabel[label2];
    const sharedAxis = p1.y === p2.y ? 'y' : 'x';
    return {
      strategy: ['Find the coordinates of the two endpoints of the side.', 'Since the side is horizontal or vertical, subtract the coordinates that differ.'],
      workedSteps: [
        `${label1} is at (${p1.x}, ${p1.y}) and ${label2} is at (${p2.x}, ${p2.y}).`,
        sharedAxis === 'y'
          ? `They share the same y-coordinate, so length = |${p2.x} − ${p1.x}| = ${answerDisplay}.`
          : `They share the same x-coordinate, so length = |${p2.y} − ${p1.y}| = ${answerDisplay}.`,
      ],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

// --- Plotting a point (interactive) -----------------------------------------------

const plotPoint = {
  id: 'grade6.coordinatePlane.plotPoint',
  grade: GRADE,
  topic: TOPIC,
  label: 'Plotting Points',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const range = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 7 : 10;
    const x = randomNonZeroInt(rng, -range, range);
    const y = randomNonZeroInt(rng, -range, range);
    const answerDisplay = `(${x}, ${y})`;
    return {
      promptText: `Plot the point ${answerDisplay} on the grid.`,
      answer: [x, y],
      answerDisplay,
      checkAnswer: coordinateCheckAnswer(x, y),
      meta: { generatorId: plotPoint.id, difficulty, x, y, answerDisplay },
      visual: { range, interactive: true, answerVisual: { range, points: [{ x, y, label: 'Answer' }] } },
    };
  },
  explain(meta) {
    const { x, y, answerDisplay } = meta;
    return {
      strategy: ['Start at the origin (0, 0).', 'Move right or left for the x-coordinate.', 'Then move up or down for the y-coordinate.'],
      workedSteps: [
        `From the origin, move ${Math.abs(x)} unit(s) ${x >= 0 ? 'right' : 'left'}.`,
        `Then move ${Math.abs(y)} unit(s) ${y >= 0 ? 'up' : 'down'}.`,
        `That's the point ${answerDisplay}.`,
      ],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

export const generators = [identifyCoordinates, reflectPoint, distanceBetweenPoints, identifyQuadrant, polygonSideLength, plotPoint];
