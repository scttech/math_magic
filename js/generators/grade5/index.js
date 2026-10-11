// Registers all grade-5 generator modules with the central registry.
// Adding a new topic later means: write the module, import it here, spread it in.
import { register } from '../../core/registry.js';
import { generators as placeValueDecimalsGenerators } from './placeValueDecimals.js';
import { generators as multiDigitArithmeticGenerators } from './multiDigitArithmetic.js';
import { generators as orderOfOperationsGenerators } from './orderOfOperations.js';
import { generators as fractionsOperationsGenerators } from './fractionsOperations.js';
import { generators as measurementVolumeGenerators } from './measurementVolume.js';
import { generators as coordinatePlaneGenerators } from './coordinatePlane.js';
import { generators as classifyShapesGenerators } from './classifyShapes.js';
import { generators as wordProblemsGenerators } from './wordProblems.js';

const allGrade5Generators = [
  ...placeValueDecimalsGenerators,
  ...multiDigitArithmeticGenerators,
  ...orderOfOperationsGenerators,
  ...fractionsOperationsGenerators,
  ...measurementVolumeGenerators,
  ...coordinatePlaneGenerators,
  ...classifyShapesGenerators,
  ...wordProblemsGenerators,
];

for (const mod of allGrade5Generators) {
  register(mod);
}
