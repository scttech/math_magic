import {
  gcd,
  reduceFraction,
  formatFraction,
  formatMixedNumber,
  addFractions,
  subFractions,
  mulFractions,
  divFractions,
  fractionsEqual,
  numericCheckAnswer,
  fractionCheckAnswer,
} from '../../js/core/problemGenerator.js';

QUnit.module('core/problemGenerator', () => {
  QUnit.test('gcd', (assert) => {
    assert.equal(gcd(12, 8), 4);
    assert.equal(gcd(-12, 8), 4);
    assert.equal(gcd(0, 5), 5);
  });

  QUnit.test('reduceFraction reduces and normalizes sign to the numerator', (assert) => {
    assert.deepEqual(reduceFraction(4, 8), { num: 1, den: 2 });
    assert.deepEqual(reduceFraction(3, -6), { num: -1, den: 2 });
    assert.deepEqual(reduceFraction(-3, -6), { num: 1, den: 2 });
  });

  QUnit.test('formatFraction', (assert) => {
    assert.equal(formatFraction({ num: 3, den: 4 }), '3/4');
    assert.equal(formatFraction({ num: 5, den: 1 }), '5');
  });

  QUnit.test('formatMixedNumber', (assert) => {
    assert.equal(formatMixedNumber({ num: 7, den: 4 }), '1 3/4');
    assert.equal(formatMixedNumber({ num: 3, den: 4 }), '3/4');
    assert.equal(formatMixedNumber({ num: 8, den: 4 }), '2');
    assert.equal(formatMixedNumber({ num: -7, den: 4 }), '-1 3/4');
  });

  QUnit.test('addFractions / subFractions', (assert) => {
    assert.deepEqual(addFractions({ num: 1, den: 4 }, { num: 1, den: 4 }), { num: 1, den: 2 });
    assert.deepEqual(subFractions({ num: 3, den: 4 }, { num: 1, den: 4 }), { num: 1, den: 2 });
  });

  QUnit.test('mulFractions / divFractions', (assert) => {
    assert.deepEqual(mulFractions({ num: 2, den: 3 }, { num: 3, den: 4 }), { num: 1, den: 2 });
    assert.deepEqual(divFractions({ num: 1, den: 2 }, { num: 1, den: 4 }), { num: 2, den: 1 });
    assert.throws(() => divFractions({ num: 1, den: 2 }, { num: 0, den: 4 }));
  });

  QUnit.test('fractionsEqual compares in reduced form', (assert) => {
    assert.ok(fractionsEqual({ num: 2, den: 4 }, { num: 1, den: 2 }));
    assert.notOk(fractionsEqual({ num: 2, den: 4 }, { num: 1, den: 3 }));
  });

  QUnit.test('numericCheckAnswer accepts within tolerance and rejects outside it', (assert) => {
    const check = numericCheckAnswer(0.75, 0.01);
    assert.ok(check(0.75));
    assert.ok(check('0.75'));
    assert.ok(check(0.749));
    assert.notOk(check(0.8));
    assert.notOk(check('not a number'));
  });

  QUnit.test('fractionCheckAnswer accepts equivalent forms and rejects wrong answers', (assert) => {
    const check = fractionCheckAnswer({ num: 1, den: 2 });
    assert.ok(check('1/2'));
    assert.ok(check('2/4'));
    assert.ok(check({ num: 3, den: 6 }));
    assert.notOk(check('1/3'));
    assert.notOk(check('not-a-fraction'));
  });

  QUnit.test('fractionCheckAnswer accepts mixed-number strings', (assert) => {
    const check = fractionCheckAnswer({ num: 13, den: 12 });
    assert.ok(check('1 1/12'), 'accepts mixed number matching formatMixedNumber output');
    assert.ok(check('13/12'), 'accepts equivalent improper fraction');
    assert.notOk(check('1 2/12'), 'rejects a wrong mixed number');

    const negativeCheck = fractionCheckAnswer({ num: -7, den: 4 });
    assert.ok(negativeCheck('-1 3/4'), 'accepts negative mixed number');
  });
});
