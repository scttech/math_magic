import { createRng } from '../../js/core/rng.js';
import { parseTags, validateTemplateText, renderTemplate, generateMixedNumber, generateAmount, ENTITY_TYPES } from '../../js/core/wordProblemTemplateEngine.js';

QUnit.module('core/wordProblemTemplateEngine', () => {
  QUnit.test('ENTITY_TYPES lists the three entity placeholder types', (assert) => {
    assert.deepEqual(ENTITY_TYPES, ['person', 'food', 'object']);
  });

  QUnit.test('parseTags extracts type, name, and range for each tag occurrence in order', (assert) => {
    const tags = parseTags('<person> has <mixed_number:start> and buys <random_number_2_to_12:quantity> more, <person> is happy.');
    assert.equal(tags.length, 4);
    assert.deepEqual(tags.map((t) => t.type), ['person', 'mixed_number', 'random_number', 'person']);
    assert.equal(tags[1].name, 'start');
    assert.equal(tags[2].name, 'quantity');
    assert.equal(tags[2].min, 2);
    assert.equal(tags[2].max, 12);
    assert.equal(tags[0].name, null);
  });

  QUnit.test('parseTags returns an empty array for text with no tags', (assert) => {
    assert.deepEqual(parseTags('no tags here'), []);
  });

  const fakePattern = {
    label: 'Fake Pattern',
    requiredRoles: [
      { type: 'mixed_number', name: 'start' },
      { type: 'random_number', name: 'quantity', exampleRange: [2, 12] },
    ],
  };

  QUnit.test('validateTemplateText rejects text with no tags', (assert) => {
    const result = validateTemplateText('This sentence has no placeholders in it at all.', null);
    assert.notOk(result.valid);
    assert.ok(result.errors.length > 0);
  });

  QUnit.test('validateTemplateText rejects an unnamed mixed_number, amount, or random_number tag', (assert) => {
    assert.notOk(validateTemplateText('<person> has <mixed_number> pounds of <food>.', null).valid);
    assert.notOk(validateTemplateText('<person> has $<amount> in savings.', null).valid);
    assert.notOk(validateTemplateText('<person> buys <random_number_1_to_10> <object>s.', null).valid);
  });

  QUnit.test('validateTemplateText rejects an invalid random_number range', (assert) => {
    const result = validateTemplateText('<person> buys <random_number_10_to_2:quantity> <object>s.', null);
    assert.notOk(result.valid);
  });

  QUnit.test('validateTemplateText rejects an unknown tag type', (assert) => {
    const result = validateTemplateText('<person> has <banana:count> pounds.', null);
    assert.notOk(result.valid);
  });

  QUnit.test('validateTemplateText requires every role the pattern declares', (assert) => {
    const missingQuantity = validateTemplateText('<person> has <mixed_number:start> pounds of <food>.', fakePattern);
    assert.notOk(missingQuantity.valid);
    assert.ok(missingQuantity.errors.some((e) => e.includes('quantity')));

    const complete = validateTemplateText('<person> has <mixed_number:start> pounds and buys <random_number_2_to_12:quantity> more.', fakePattern);
    assert.ok(complete.valid, complete.errors.join('; '));
  });

  QUnit.test('generateMixedNumber returns a positive improper fraction sized for the difficulty', (assert) => {
    for (let seed = 0; seed < 100; seed++) {
      for (const difficulty of ['easy', 'medium', 'hard']) {
        const rng = createRng(seed * 3 + difficulty.length);
        const value = generateMixedNumber(rng, difficulty);
        assert.ok(Number.isInteger(value.num) && value.num > 0, `seed ${seed} ${difficulty}: positive numerator`);
        assert.ok(Number.isInteger(value.den) && value.den >= 1, `seed ${seed} ${difficulty}: integer denominator`);
      }
    }
  });

  QUnit.test('generateAmount returns a decimal value to the cent, sized for the difficulty', (assert) => {
    for (let seed = 0; seed < 100; seed++) {
      for (const difficulty of ['easy', 'medium', 'hard']) {
        const rng = createRng(seed * 5 + difficulty.length);
        const value = generateAmount(rng, difficulty);
        assert.ok(value > 0, `seed ${seed} ${difficulty}: positive amount`);
        const cents = Math.round(value * 100);
        assert.ok(Math.abs(cents - value * 100) < 1e-6, `seed ${seed} ${difficulty}: exactly two decimal places (${value})`);
      }
    }
  });

  QUnit.test('renderTemplate formats an <amount> tag as a plain decimal, not a fraction', (assert) => {
    const pattern = {
      requiredRoles: [{ type: 'amount', name: 'price' }],
      compute: (values) => ({ answer: values.price, answerDisplay: values.price.toFixed(2), checkAnswer: () => true }),
    };
    const wordLists = { person: ['P'], food: ['F'], object: ['O'] };
    for (let seed = 0; seed < 50; seed++) {
      const rng = createRng(seed);
      const { promptText } = renderTemplate({ text: 'It costs $<amount:price> exactly.', pattern, rng, difficulty: 'medium', wordLists });
      assert.ok(/^It costs \$\d+\.\d{2} exactly\.$/.test(promptText), `seed ${seed}: "${promptText}" looks like a real price`);
    }
  });

  QUnit.test('renderTemplate reuses the same word for repeated entity tags of the same name', (assert) => {
    const pattern = {
      requiredRoles: [],
      compute: () => ({ answer: 0, answerDisplay: '0', checkAnswer: () => true }),
    };
    const wordLists = { person: ['OnlyPerson'], food: ['OnlyFood'], object: ['OnlyObject'] };
    const rng = createRng(1);
    const { promptText } = renderTemplate({ text: '<person> likes <food>. <person> eats more <food>.', pattern, rng, difficulty: 'medium', wordLists });
    assert.equal(promptText, 'OnlyPerson likes OnlyFood. OnlyPerson eats more OnlyFood.');
  });

  QUnit.test('renderTemplate resolves value tags to what compute() actually used, and checkAnswer round-trips', (assert) => {
    const pattern = {
      requiredRoles: [
        { type: 'random_number', name: 'a' },
        { type: 'random_number', name: 'b' },
      ],
      compute(values) {
        const sum = values.a + values.b;
        return { answer: sum, answerDisplay: String(sum), checkAnswer: (input) => Number(input) === sum };
      },
    };
    const wordLists = { person: ['P'], food: ['F'], object: ['O'] };
    for (let seed = 0; seed < 50; seed++) {
      const rng = createRng(seed);
      const { promptText, answerDisplay, checkAnswer } = renderTemplate({
        text: '<random_number_1_to_10:a> plus <random_number_1_to_10:b> equals what?',
        pattern,
        rng,
        difficulty: 'medium',
        wordLists,
      });
      const match = /^(\d+) plus (\d+) equals what\?$/.exec(promptText);
      assert.ok(match, `seed ${seed}: rendered text matches expected shape (${promptText})`);
      const [, aText, bText] = match;
      assert.equal(answerDisplay, String(Number(aText) + Number(bText)), `seed ${seed}: answer matches rendered numbers`);
      assert.ok(checkAnswer(answerDisplay), `seed ${seed}: checkAnswer accepts the correct answer`);
      assert.notOk(checkAnswer(Number(answerDisplay) + 1000), `seed ${seed}: checkAnswer rejects a wrong answer`);
    }
  });

  QUnit.test('renderTemplate also returns the resolved role values, for the help system to reuse', (assert) => {
    const pattern = {
      requiredRoles: [{ type: 'mixed_number', name: 'start' }],
      compute: (values) => ({ answer: values.start, answerDisplay: 'x', checkAnswer: () => true }),
    };
    const wordLists = { person: ['P'], food: ['F'], object: ['O'] };
    const rng = createRng(7);
    const { values } = renderTemplate({ text: '<person> has <mixed_number:start> pounds of <food>.', pattern, rng, difficulty: 'medium', wordLists });
    assert.ok(values.start && Number.isInteger(values.start.num) && Number.isInteger(values.start.den), 'values.start is a fraction object');
  });
});
