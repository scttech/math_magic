// Grade-agnostic shape-identification drill: a shape is drawn (see
// shapeRenderer.js) and the student picks its name from 4 choices. Same
// architecture as multiplicationTables.js — lives outside the grade/topic
// registry since it's multiple-choice, not the free-text quiz contract.
import { randomChoice, shuffle } from '../core/rng.js';
import { SHAPE_IDS } from './shapeRenderer.js';

export const GENERATOR_ID = 'skills.shapeIdentification';

function labelFor(id) {
  const words = id.replace(/([a-z])([A-Z])/g, '$1 $2');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export const SHAPES = SHAPE_IDS.map((id) => ({
  id,
  name: labelFor(id),
  category: ['cube', 'rectangularPrism', 'triangularPrism', 'cylinder', 'cone', 'sphere', 'squarePyramid'].includes(id) ? '3D' : '2D',
}));

/** One multiple-choice shape problem: a random shape from the allowed categories, plus 3 other shape names as distractors. */
export function generateProblem(rng, categories) {
  const pool = SHAPES.filter((s) => categories.includes(s.category));
  const correct = randomChoice(rng, pool);
  const distractorPool = pool.filter((s) => s.id !== correct.id);
  const distractors = shuffle(rng, distractorPool).slice(0, 3);
  const choices = shuffle(rng, [correct, ...distractors]).map((s) => s.name);
  return { shapeId: correct.id, promptText: correct.name, answer: correct.name, answerDisplay: correct.name, choices };
}
