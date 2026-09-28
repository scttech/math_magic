// Builds a reproducible list of problems from the registry — shared by the
// Quiz and Worksheet Builder. Each problem gets its own rng derived from
// `seed + index`, so the same (topics, difficulty, count, seed) tuple always
// regenerates an identical set of problems.
import { getByTopic } from './registry.js';
import { createRng, randomInt } from './rng.js';

export function buildProblemSet({ grade, topics, difficulty, count, seed }) {
  const pool = topics.flatMap((topic) => getByTopic(grade, topic));
  const problems = [];
  for (let i = 0; i < count; i++) {
    const problemSeed = seed + i;
    const rng = createRng(problemSeed);
    const generatorModule = pool[randomInt(rng, 0, pool.length - 1)];
    const problem = generatorModule.generate({ difficulty, rng });
    problems.push({ ...problem, topic: generatorModule.topic, seed: problemSeed });
  }
  return problems;
}
