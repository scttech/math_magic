import { parseNumberSpec } from '../../js/skills/numberSpec.js';

QUnit.module('skills/numberSpec', () => {
  QUnit.test('parses a single number', (assert) => {
    assert.deepEqual(parseNumberSpec('5', 0, 20), [5]);
  });

  QUnit.test('parses a range', (assert) => {
    assert.deepEqual(parseNumberSpec('1-5', 0, 20), [1, 2, 3, 4, 5]);
  });

  QUnit.test('swaps a reversed range', (assert) => {
    assert.deepEqual(parseNumberSpec('5-1', 0, 20), [1, 2, 3, 4, 5]);
  });

  QUnit.test('parses a comma list mixed with a range, deduping and sorting', (assert) => {
    assert.deepEqual(parseNumberSpec('2, 5-7, 2', 0, 20), [2, 5, 6, 7]);
  });

  QUnit.test('trims whitespace around tokens', (assert) => {
    assert.deepEqual(parseNumberSpec('  2 ,  4  ', 0, 20), [2, 4]);
  });

  QUnit.test('rejects an empty or blank spec', (assert) => {
    assert.equal(parseNumberSpec('', 0, 20), null);
    assert.equal(parseNumberSpec('   ', 0, 20), null);
  });

  QUnit.test('rejects non-numeric tokens', (assert) => {
    assert.equal(parseNumberSpec('abc', 0, 20), null);
    assert.equal(parseNumberSpec('2,abc', 0, 20), null);
  });

  QUnit.test('rejects negative numbers', (assert) => {
    assert.equal(parseNumberSpec('-5', 0, 20), null);
  });

  QUnit.test('respects the given min/max bounds, independent of any other caller', (assert) => {
    assert.equal(parseNumberSpec('21', 0, 20), null);
    assert.equal(parseNumberSpec('0', 1, 20), null);
    assert.deepEqual(parseNumberSpec('50', 0, 50), [50]);
  });
});
