import { createRng } from '../../js/core/rng.js';
import { SHAPES, generateProblem } from '../../js/skills/shapeIdentification.js';
import { SHAPE_IDS, renderShape } from '../../js/skills/shapeRenderer.js';

QUnit.module('skills/shapeIdentification', () => {
  QUnit.test('every drawable shape has exactly one SHAPES entry, with a readable name and a 2D/3D category', (assert) => {
    assert.equal(SHAPES.length, SHAPE_IDS.length, 'one entry per drawable shape id');
    const seenIds = new Set();
    for (const shape of SHAPES) {
      assert.ok(SHAPE_IDS.includes(shape.id), `${shape.id}: is a real drawable shape`);
      assert.notOk(seenIds.has(shape.id), `${shape.id}: id is not duplicated`);
      seenIds.add(shape.id);
      assert.ok(shape.name.length > 0 && shape.name[0] === shape.name[0].toUpperCase(), `${shape.id}: name "${shape.name}" is capitalized`);
      assert.ok(['2D', '3D'].includes(shape.category), `${shape.id}: category is 2D or 3D`);
    }
  });

  QUnit.test('generateProblem only draws from the requested categories', (assert) => {
    for (const categories of [['2D'], ['3D'], ['2D', '3D']]) {
      for (let seed = 0; seed < 100; seed++) {
        const rng = createRng(seed);
        const problem = generateProblem(rng, categories);
        const shape = SHAPES.find((s) => s.id === problem.shapeId);
        assert.ok(categories.includes(shape.category), `categories=${categories}, seed ${seed}: ${shape.id} (${shape.category}) is in range`);
      }
    }
  });

  QUnit.test('generateProblem returns 4 unique choices including the correct shape name, and no duplicate-shape distractors', (assert) => {
    for (let seed = 0; seed < 150; seed++) {
      const rng = createRng(seed);
      const problem = generateProblem(rng, ['2D', '3D']);
      assert.equal(problem.choices.length, 4, `seed ${seed}: 4 choices`);
      assert.equal(new Set(problem.choices).size, 4, `seed ${seed}: choices are unique`);
      assert.ok(problem.choices.includes(problem.answerDisplay), `seed ${seed}: choices include the correct shape name`);
    }
  });

  QUnit.test('generateProblem still works when a category has few shapes (distractors never exceed the available pool)', (assert) => {
    // Sanity check the pools are big enough for 4 choices even filtered to one category.
    const twoD = SHAPES.filter((s) => s.category === '2D').length;
    const threeD = SHAPES.filter((s) => s.category === '3D').length;
    assert.ok(twoD >= 4, `2D pool has at least 4 shapes (has ${twoD})`);
    assert.ok(threeD >= 4, `3D pool has at least 4 shapes (has ${threeD})`);
  });

  QUnit.test('renderShape draws a labeled SVG into the container for every known shape id', (assert) => {
    for (const shapeId of SHAPE_IDS) {
      const container = document.createElement('div');
      renderShape(container, shapeId, 160);
      const svg = container.querySelector('svg');
      assert.ok(svg, `${shapeId}: renders an <svg>`);
      assert.ok(svg.querySelectorAll('polygon, circle, ellipse, rect, line').length > 0, `${shapeId}: draws at least one shape element`);
    }
  });

  QUnit.test('renderShape leaves the container empty for an unknown shape id', (assert) => {
    const container = document.createElement('div');
    renderShape(container, 'not-a-real-shape', 160);
    assert.equal(container.innerHTML, '');
  });
});
