// Registers all grade-6 generator modules with the central registry.
// Adding a new topic later means: write the module, import it here, spread it in.
import { register } from '../../core/registry.js';
import { generators as fractionsDecimalsGenerators } from './fractionsDecimals.js';
import { generators as ratiosProportionsGenerators } from './ratiosProportions.js';
import { generators as negativeNumbersGenerators } from './negativeNumbers.js';
import { generators as expressionsEquationsGenerators } from './expressionsEquations.js';
import { generators as areaSurfaceVolumeGenerators } from './areaSurfaceVolume.js';
import { generators as statisticsGenerators } from './statistics.js';
import { generators as wordProblemsGenerators } from './wordProblems.js';
import { generators as rationalIrrationalGenerators } from './rationalIrrational.js';

const allGrade6Generators = [
  ...fractionsDecimalsGenerators,
  ...ratiosProportionsGenerators,
  ...negativeNumbersGenerators,
  ...expressionsEquationsGenerators,
  ...areaSurfaceVolumeGenerators,
  ...statisticsGenerators,
  ...wordProblemsGenerators,
  ...rationalIrrationalGenerators,
];

for (const mod of allGrade6Generators) {
  register(mod);
}
