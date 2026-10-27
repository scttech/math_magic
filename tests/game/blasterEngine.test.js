import { createRng } from '../../js/core/rng.js';
import {
  fallSpeedForScore,
  isPointInCircle,
  layoutStartPositions,
  buildBubbleChoices,
  wrapWords,
  fitLabelToCircle,
  BASE_FALL_SPEED,
  SPEED_RAMP_PER_CORRECT,
  MAX_FALL_SPEED,
} from '../../js/game/blasterEngine.js';

// A simple, deterministic stand-in for ctx.measureText(text).width — roughly
// matches bold sans-serif metrics closely enough to exercise the wrapping/
// shrinking logic without needing a real canvas.
function fakeMeasure(text, fontSize) {
  return text.length * fontSize * 0.6;
}

QUnit.module('game/blasterEngine', () => {
  QUnit.test('fallSpeedForScore starts at the base speed and ramps up with score', (assert) => {
    assert.equal(fallSpeedForScore(0), BASE_FALL_SPEED);
    assert.equal(fallSpeedForScore(1), BASE_FALL_SPEED + SPEED_RAMP_PER_CORRECT);
    assert.equal(fallSpeedForScore(5), BASE_FALL_SPEED + 5 * SPEED_RAMP_PER_CORRECT);
  });

  QUnit.test('fallSpeedForScore never exceeds the max speed', (assert) => {
    assert.equal(fallSpeedForScore(1000), MAX_FALL_SPEED);
  });

  QUnit.test('isPointInCircle accepts points inside or on the edge, rejects points outside', (assert) => {
    assert.ok(isPointInCircle(100, 100, 100, 100, 10), 'dead center');
    assert.ok(isPointInCircle(108, 100, 100, 100, 10), 'inside');
    assert.ok(isPointInCircle(110, 100, 100, 100, 10), 'exactly on the edge');
    assert.notOk(isPointInCircle(115, 100, 100, 100, 10), 'outside');
    assert.notOk(isPointInCircle(100, 0, 100, 100, 10), 'far above');
  });

  QUnit.test('layoutStartPositions returns one position per item, spread across the width within the margins', (assert) => {
    for (let seed = 0; seed < 50; seed++) {
      const rng = createRng(seed);
      const positions = layoutStartPositions(rng, 4, 640, 40);
      assert.equal(positions.length, 4, `seed ${seed}: one position per item`);
      for (const x of positions) {
        assert.ok(x >= 0 && x <= 640, `seed ${seed}: position ${x} stays within the canvas width`);
      }
      // Roughly ascending left-to-right despite jitter.
      assert.ok(positions[0] < positions[3], `seed ${seed}: first slot is left of the last slot`);
    }
  });

  QUnit.test('layoutStartPositions is deterministic for a given seed', (assert) => {
    const a = layoutStartPositions(createRng(7), 4, 640, 40);
    const b = layoutStartPositions(createRng(7), 4, 640, 40);
    assert.deepEqual(a, b);
  });

  QUnit.test('buildBubbleChoices returns just the base choices (no generateMore calls) when bubbleCount is already met', (assert) => {
    const problem = { choices: ['1', '2', '3', '4'], answerDisplay: '2' };
    let calls = 0;
    const result = buildBubbleChoices(createRng(1), problem, 4, () => {
      calls += 1;
      return { choices: ['nope'], answerDisplay: '2' };
    });
    assert.equal(calls, 0, 'generateMore is never called once the target count is already met');
    assert.deepEqual([...result].sort(), ['1', '2', '3', '4']);
  });

  QUnit.test('buildBubbleChoices tops up to bubbleCount with distinct extra distractors, excluding the correct answer', (assert) => {
    const problem = { choices: ['10', '11', '12', '13'], answerDisplay: '10' };
    let n = 100;
    const generateMore = () => ({ choices: [String(n++), '10'], answerDisplay: '10' }); // '10' re-offered each time but must never duplicate the real correct bubble
    const result = buildBubbleChoices(createRng(1), problem, 7, generateMore);

    assert.equal(result.length, 7);
    assert.equal(new Set(result).size, 7, 'every bubble is distinct');
    assert.equal(result.filter((c) => c === '10').length, 1, 'the correct answer appears exactly once');
  });

  QUnit.test('buildBubbleChoices degrades gracefully when the extra pool runs out, instead of looping forever', (assert) => {
    const problem = { choices: ['a', 'b', 'c', 'd'], answerDisplay: 'a' };
    // Only ever offers the same one new distractor, "e" - can never reach 8.
    const result = buildBubbleChoices(createRng(1), problem, 8, () => ({ choices: ['e'], answerDisplay: 'a' }));
    assert.equal(result.length, 5, 'stops at however many distinct bubbles actually exist (4 base + "e")');
    assert.ok(result.includes('a'), 'the correct answer is still present');
  });

  QUnit.test('buildBubbleChoices is deterministic for a given seed', (assert) => {
    const problem = { choices: ['1', '2', '3', '4'], answerDisplay: '1' };
    const generateMore = () => ({ choices: ['5', '6'], answerDisplay: '1' });
    const a = buildBubbleChoices(createRng(42), { ...problem }, 6, generateMore);
    const b = buildBubbleChoices(createRng(42), { ...problem }, 6, generateMore);
    assert.deepEqual(a, b);
  });

  QUnit.test('wrapWords keeps short text on one line when it already fits', (assert) => {
    const measure = (t) => fakeMeasure(t, 14);
    assert.deepEqual(wrapWords(['Cone'], 200, measure), ['Cone']);
  });

  QUnit.test('wrapWords breaks at word boundaries once a line would exceed maxWidth', (assert) => {
    const measure = (t) => fakeMeasure(t, 14);
    const maxWidth = fakeMeasure('Rectangular', 14) + 1; // just barely too narrow for both words on one line
    assert.deepEqual(wrapWords(['Rectangular', 'Prism'], maxWidth, measure), ['Rectangular', 'Prism']);
  });

  QUnit.test('wrapWords leaves an overlong single word on its own (overflowing) line by default', (assert) => {
    const measure = (t) => fakeMeasure(t, 14);
    assert.deepEqual(wrapWords(['Parallelogram'], 50, measure), ['Parallelogram']);
  });

  QUnit.test('wrapWords character-splits a single word that alone exceeds maxWidth when allowCharSplit is true', (assert) => {
    const measure = (t) => fakeMeasure(t, 14);
    const lines = wrapWords(['Parallelogram'], 50, measure, true);
    assert.ok(lines.length > 1, 'a word wider than maxWidth on its own is split across multiple lines');
    assert.equal(lines.join(''), 'Parallelogram', 'splitting loses no characters');
    for (const line of lines) {
      assert.ok(measure(line) <= 50 || line.length === 1, `line "${line}" fits maxWidth (or is an unsplittable single character)`);
    }
  });

  QUnit.test('wrapWords never drops or reorders any characters', (assert) => {
    const measure = (t) => fakeMeasure(t, 12);
    const words = ['Triangular', 'Prism'];
    const lines = wrapWords(words, 40, measure);
    assert.equal(lines.join('').replace(/\s/g, ''), words.join(''), 'joining the wrapped lines reconstructs the original text');
  });

  QUnit.test('fitLabelToCircle keeps a short label at the max font size, one line', (assert) => {
    const layout = fitLabelToCircle('12', 32, fakeMeasure);
    assert.equal(layout.fontSize, 15);
    assert.deepEqual(layout.lines, ['12']);
  });

  QUnit.test('fitLabelToCircle shrinks and/or wraps a long label until it fits the circle', (assert) => {
    for (const label of ['Parallelogram', 'Rectangular Prism', 'Triangular Prism', 'Heptagon']) {
      const radius = 32;
      const layout = fitLabelToCircle(label, radius, fakeMeasure);
      const widestLine = Math.max(...layout.lines.map((l) => fakeMeasure(l, layout.fontSize)));
      const totalHeight = layout.lines.length * layout.lineHeight;
      assert.ok(widestLine <= radius * 1.7 + 0.001, `"${label}": widest line (${widestLine.toFixed(1)}) fits the circle's width budget`);
      assert.ok(totalHeight <= radius * 1.8 + 0.001, `"${label}": total text height (${totalHeight.toFixed(1)}) fits the circle's height budget`);
      assert.equal(layout.lines.join('').replace(/\s/g, ''), label.replace(/\s/g, ''), `"${label}": no characters lost while fitting`);
    }
  });

  QUnit.test('fitLabelToCircle falls back to the smallest font size for a label that never fully fits', (assert) => {
    const layout = fitLabelToCircle('Parallelogram', 3, fakeMeasure, { minFontSize: 9, maxFontSize: 15 });
    assert.equal(layout.fontSize, 9);
  });

  QUnit.test('fitLabelToCircle respects a custom min/max font size range', (assert) => {
    const layout = fitLabelToCircle('1', 32, fakeMeasure, { minFontSize: 20, maxFontSize: 20 });
    assert.equal(layout.fontSize, 20);
  });
});
