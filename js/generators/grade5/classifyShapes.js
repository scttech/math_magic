// 5.G.B: classifying 2D figures based on their properties, understanding that
// attributes of a category also belong to its subcategories (e.g. every
// square is a rectangle, but not every rectangle is a square).
import { randomChoice } from '../../core/rng.js';

const GRADE = '5';
const TOPIC = 'classifyShapes';

const STATEMENTS_BY_DIFFICULTY = {
  easy: [
    { statement: 'A square is always a rectangle.', isTrue: true, explanation: 'A square has four right angles and opposite sides equal, which makes it a special kind of rectangle.' },
    { statement: 'A square is always a quadrilateral.', isTrue: true, explanation: 'Any four-sided polygon is a quadrilateral, and a square has four sides.' },
    { statement: 'A triangle has three sides.', isTrue: true, explanation: 'A triangle is defined as a polygon with exactly three sides.' },
    { statement: 'A rectangle always has four right angles.', isTrue: true, explanation: "That's part of the definition of a rectangle." },
    { statement: 'A circle is a type of quadrilateral.', isTrue: false, explanation: 'A quadrilateral must have four straight sides; a circle has none.' },
    { statement: 'All four sides of a square are equal in length.', isTrue: true, explanation: "Equal side lengths are part of a square's definition." },
  ],
  medium: [
    { statement: 'A rectangle is always a square.', isTrue: false, explanation: "A rectangle only needs four right angles — its sides don't have to be equal, so not every rectangle is a square." },
    { statement: 'A rhombus is always a square.', isTrue: false, explanation: "A rhombus only needs four equal sides — its angles don't have to be right angles, so not every rhombus is a square." },
    { statement: 'A square is always a rhombus.', isTrue: true, explanation: 'A square has four equal sides, which is exactly what makes a shape a rhombus.' },
    { statement: 'A rectangle is always a parallelogram.', isTrue: true, explanation: 'A rectangle has two pairs of parallel sides, which makes it a parallelogram.' },
    { statement: 'A parallelogram is always a rectangle.', isTrue: false, explanation: "A parallelogram only needs opposite sides parallel — its angles don't have to be right angles." },
    { statement: 'A parallelogram is always a quadrilateral.', isTrue: true, explanation: 'Any four-sided shape is a quadrilateral, and a parallelogram has four sides.' },
    { statement: 'A trapezoid is always a parallelogram.', isTrue: false, explanation: 'A trapezoid only needs one pair of parallel sides, not two.' },
  ],
  hard: [
    { statement: 'A quadrilateral is always a parallelogram.', isTrue: false, explanation: "A quadrilateral is just any four-sided shape — it doesn't need any parallel sides at all." },
    { statement: 'An equilateral triangle is always an isosceles triangle.', isTrue: true, explanation: 'Isosceles means at least two sides are equal, and an equilateral triangle has all three sides equal, so it qualifies.' },
    { statement: 'An isosceles triangle is always an equilateral triangle.', isTrue: false, explanation: 'An isosceles triangle only needs two equal sides — the third side can be different.' },
    { statement: 'A right triangle has exactly one 90° angle.', isTrue: true, explanation: "A triangle's angles always add up to 180°, so only one angle can be 90° or more." },
    { statement: 'A scalene triangle has at least two equal sides.', isTrue: false, explanation: "A scalene triangle has no equal sides at all — that's what makes it scalene." },
    { statement: 'Every square is a rectangle, and every rectangle is a parallelogram.', isTrue: true, explanation: "Each category's defining properties are also true for the more specific shape, so squares fit inside rectangles, which fit inside parallelograms." },
  ],
};

function trueFalseCheckAnswer(expectedTrue) {
  return (userInput) => {
    if (typeof userInput !== 'string') return false;
    const cleaned = userInput.trim().toLowerCase();
    const isTrue = cleaned === 'true' || cleaned === 't' || cleaned === 'yes' || cleaned === 'y';
    const isFalse = cleaned === 'false' || cleaned === 'f' || cleaned === 'no' || cleaned === 'n';
    if (!isTrue && !isFalse) return false;
    return isTrue === expectedTrue;
  };
}

const classifyShapes = {
  id: 'grade5.classifyShapes.classifyShapes',
  grade: GRADE,
  topic: TOPIC,
  label: 'Classifying Shapes',
  difficulties: ['easy', 'medium', 'hard'],
  generate({ difficulty, rng }) {
    const pool = STATEMENTS_BY_DIFFICULTY[difficulty] || STATEMENTS_BY_DIFFICULTY.medium;
    const entry = randomChoice(rng, pool);
    const answerDisplay = entry.isTrue ? 'True' : 'False';
    return {
      promptText: `True or False: ${entry.statement}`,
      answer: entry.isTrue,
      answerDisplay,
      checkAnswer: trueFalseCheckAnswer(entry.isTrue),
      meta: { generatorId: classifyShapes.id, difficulty, statement: entry.statement, explanation: entry.explanation, answerDisplay },
    };
  },
  explain(meta) {
    const { statement, explanation, answerDisplay } = meta;
    return {
      strategy: ['Think about the definition of each shape, and whether one category’s properties are fully contained inside the other.'],
      workedSteps: [`"${statement}" is ${answerDisplay}.`, explanation],
      finalAnswerDisplay: answerDisplay,
    };
  },
};

export const generators = [classifyShapes];
