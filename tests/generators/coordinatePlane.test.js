import { createRng } from '../../js/core/rng.js';
import { generators } from '../../js/generators/grade6/coordinatePlane.js';

const byId = Object.fromEntries(generators.map((g) => [g.id, g]));

QUnit.module('generators/grade6/coordinatePlane', () => {
  QUnit.test('every generator declares grade 6 and the coordinatePlane topic, and carries a visual field', (assert) => {
    for (const gen of generators) {
      assert.equal(gen.grade, '6', `${gen.id} grade`);
      assert.equal(gen.topic, 'coordinatePlane', `${gen.id} topic`);
      assert.ok(gen.id.startsWith('grade6.coordinatePlane.'), `${gen.id} id prefix`);
      const rng = createRng(1);
      const problem = gen.generate({ difficulty: 'medium', rng });
      assert.ok(problem.visual && typeof problem.visual.range === 'number' && problem.visual.range > 0, `${gen.id}: visual.range is a positive number`);
    }
  });

  QUnit.test('identifyCoordinates: checkAnswer accepts several equivalent formats', (assert) => {
    const gen = byId['grade6.coordinatePlane.identifyCoordinates'];
    for (let seed = 0; seed < 60; seed++) {
      const rng = createRng(seed);
      const problem = gen.generate({ difficulty: 'medium', rng });
      const { x, y } = problem.meta;
      assert.ok(problem.checkAnswer(`(${x}, ${y})`), `seed ${seed}: accepts "(x, y)"`);
      assert.ok(problem.checkAnswer(`${x},${y}`), `seed ${seed}: accepts "x,y"`);
      assert.ok(problem.checkAnswer(`  ${x} , ${y}  `), `seed ${seed}: tolerates extra whitespace`);
      if (x !== y) {
        assert.notOk(problem.checkAnswer(`(${y}, ${x})`), `seed ${seed}: rejects swapped coordinates`);
      }
    }
  });

  QUnit.test('reflectPoint: reflecting across the x-axis flips y only; across the y-axis flips x only', (assert) => {
    const gen = byId['grade6.coordinatePlane.reflectPoint'];
    for (let seed = 0; seed < 100; seed++) {
      const rng = createRng(seed);
      const problem = gen.generate({ difficulty: 'medium', rng });
      const { x, y, axis } = problem.meta;
      const [rx, ry] = problem.answer;
      if (axis === 'x-axis') {
        assert.equal(rx, x, `seed ${seed}: x unchanged`);
        assert.equal(ry, -y, `seed ${seed}: y flipped`);
      } else {
        assert.equal(rx, -x, `seed ${seed}: x flipped`);
        assert.equal(ry, y, `seed ${seed}: y unchanged`);
      }
      assert.ok(problem.checkAnswer(problem.answerDisplay), `seed ${seed}: checkAnswer accepts its own answer`);
    }
  });

  QUnit.test('distanceBetweenPoints: the two points always share exactly one coordinate, are distinct, and the distance is correct', (assert) => {
    const gen = byId['grade6.coordinatePlane.distanceBetweenPoints'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 80; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const { ax, ay, bx, by, sameAxis } = problem.meta;
        assert.notOk(ax === bx && ay === by, `[${difficulty}] seed ${seed}: points are distinct`);
        if (sameAxis === 'x') {
          assert.equal(ax, bx, `[${difficulty}] seed ${seed}: x-coordinates match`);
          assert.equal(problem.answer, Math.abs(by - ay), `[${difficulty}] seed ${seed}: distance is |Δy|`);
        } else {
          assert.equal(ay, by, `[${difficulty}] seed ${seed}: y-coordinates match`);
          assert.equal(problem.answer, Math.abs(bx - ax), `[${difficulty}] seed ${seed}: distance is |Δx|`);
        }
        assert.ok(problem.answer > 0, `[${difficulty}] seed ${seed}: distance is positive`);
      }
    }
  });

  QUnit.test('identifyQuadrant: the quadrant always matches the sign of x and y, and checkAnswer accepts roman numeral, digit, and "Quadrant X" forms', (assert) => {
    const gen = byId['grade6.coordinatePlane.identifyQuadrant'];
    const expectedByQuadrant = { I: [1, 1], II: [-1, 1], III: [-1, -1], IV: [1, -1] };
    for (let seed = 0; seed < 100; seed++) {
      const rng = createRng(seed);
      const problem = gen.generate({ difficulty: 'medium', rng });
      const { x, y, quadrant } = problem.meta;
      const [signX, signY] = expectedByQuadrant[quadrant];
      assert.equal(Math.sign(x), signX, `seed ${seed}: x sign matches quadrant ${quadrant}`);
      assert.equal(Math.sign(y), signY, `seed ${seed}: y sign matches quadrant ${quadrant}`);
      assert.ok(problem.checkAnswer(quadrant), `seed ${seed}: accepts roman numeral`);
      assert.ok(problem.checkAnswer(`Quadrant ${quadrant}`), `seed ${seed}: accepts "Quadrant X"`);
      assert.ok(problem.checkAnswer({ I: '1', II: '2', III: '3', IV: '4' }[quadrant]), `seed ${seed}: accepts the digit form`);
    }
  });

  QUnit.test('polygonSideLength: ABCD is a true axis-aligned rectangle, and the asked side length is exact', (assert) => {
    const gen = byId['grade6.coordinatePlane.polygonSideLength'];
    for (const difficulty of gen.difficulties) {
      for (let seed = 0; seed < 80; seed++) {
        const rng = createRng(seed);
        const problem = gen.generate({ difficulty, rng });
        const [a, b, c, d] = problem.meta.vertices;
        assert.equal(a.y, b.y, `[${difficulty}] seed ${seed}: AB is horizontal`);
        assert.equal(b.x, c.x, `[${difficulty}] seed ${seed}: BC is vertical`);
        assert.equal(c.y, d.y, `[${difficulty}] seed ${seed}: CD is horizontal`);
        assert.equal(d.x, a.x, `[${difficulty}] seed ${seed}: DA is vertical`);
        const width = Math.abs(b.x - a.x);
        const height = Math.abs(c.y - b.y);
        const expected = problem.meta.sideChoice === 'AB' ? width : height;
        assert.equal(problem.answer, expected, `[${difficulty}] seed ${seed}: ${problem.meta.sideChoice} length is correct`);
        assert.ok(problem.answer > 0, `[${difficulty}] seed ${seed}: side length is positive`);
      }
    }
  });

  QUnit.test('plotPoint: is interactive, carries an answerVisual with the correct point, and checkAnswer accepts the formatted click', (assert) => {
    const gen = byId['grade6.coordinatePlane.plotPoint'];
    for (let seed = 0; seed < 60; seed++) {
      const rng = createRng(seed);
      const problem = gen.generate({ difficulty: 'medium', rng });
      const { x, y } = problem.meta;
      assert.ok(problem.visual.interactive, `seed ${seed}: visual.interactive is true`);
      assert.deepEqual(problem.visual.answerVisual.points, [{ x, y, label: 'Answer' }], `seed ${seed}: answerVisual marks the correct point`);
      assert.ok(problem.checkAnswer(`(${x}, ${y})`), `seed ${seed}: checkAnswer accepts a formatted click`);
      assert.notOk(problem.checkAnswer(`(${x + 1}, ${y})`), `seed ${seed}: checkAnswer rejects an off-by-one click`);
    }
  });
});
