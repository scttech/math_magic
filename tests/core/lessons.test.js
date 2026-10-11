import '../../js/generators/grade5/index.js';
import '../../js/generators/grade6/index.js';
import { createRng } from '../../js/core/rng.js';
import { getById } from '../../js/core/registry.js';
import { LESSONS, listLessons, getLessonById } from '../../js/core/lessons.js';
import { addFractions, mulFractions, divFractions, reduceFraction, formatFraction, formatMixedNumber, roundTo } from '../../js/core/problemGenerator.js';

QUnit.module('core/lessons', () => {
  QUnit.test('every lesson has a unique id, a title, a summary, and a non-empty block list', (assert) => {
    const ids = LESSONS.map((l) => l.id);
    assert.equal(new Set(ids).size, ids.length, 'lesson ids are unique');
    for (const lesson of LESSONS) {
      assert.ok(lesson.title && lesson.title.length > 0, `${lesson.id}: has a title`);
      assert.ok(lesson.summary && lesson.summary.length > 0, `${lesson.id}: has a summary`);
      assert.ok(Array.isArray(lesson.blocks) && lesson.blocks.length > 0, `${lesson.id}: has blocks`);
    }
  });

  QUnit.test('getLessonById finds a real lesson and returns null for an unknown id', (assert) => {
    assert.equal(getLessonById('grade6-addSubtractFractions').id, 'grade6-addSubtractFractions');
    assert.equal(getLessonById('nope'), null);
  });

  QUnit.test('listLessons returns every lesson', (assert) => {
    assert.equal(listLessons().length, LESSONS.length);
  });

  QUnit.test("every lesson's generatorId resolves to a real, registered generator matching its declared grade/topic", (assert) => {
    for (const lesson of LESSONS) {
      const mod = getById(lesson.generatorId);
      assert.ok(mod, `${lesson.id}: generatorId "${lesson.generatorId}" is registered`);
      if (!mod) continue;
      assert.equal(mod.grade, lesson.grade, `${lesson.id}: generator grade matches the lesson's declared grade`);
      assert.equal(mod.topic, lesson.topic, `${lesson.id}: generator topic matches the lesson's declared topic`);
      assert.equal(typeof mod.explain, 'function', `${lesson.id}: generator has an explain() for the checkpoint "Show Me How" reveal`);
    }
  });

  QUnit.test('every checkpoint block uses a difficulty the generator actually declares', (assert) => {
    for (const lesson of LESSONS) {
      const mod = getById(lesson.generatorId);
      for (const block of lesson.blocks) {
        if (block.type !== 'checkpoint') continue;
        assert.ok(mod.difficulties.includes(block.difficulty), `${lesson.id}: checkpoint difficulty "${block.difficulty}" is one of ${mod.difficulties.join(', ')}`);
        assert.ok(block.intro && block.intro.length > 0, `${lesson.id}: checkpoint has intro text`);
      }
    }
  });

  QUnit.test('every text block has a heading and non-empty paragraphs', (assert) => {
    for (const lesson of LESSONS) {
      for (const block of lesson.blocks) {
        if (block.type !== 'text') continue;
        assert.ok(block.heading && block.heading.length > 0, `${lesson.id}: text block has a heading`);
        assert.ok(Array.isArray(block.body) && block.body.length > 0, `${lesson.id}: text block has body paragraphs`);
        assert.ok(block.body.every((p) => typeof p === 'string' && p.length > 0), `${lesson.id}: every paragraph is a non-empty string`);
      }
    }
  });

  QUnit.test('every example block has a heading, prompt, non-empty steps, and an answerDisplay', (assert) => {
    for (const lesson of LESSONS) {
      for (const block of lesson.blocks) {
        if (block.type !== 'example') continue;
        assert.ok(block.heading && block.heading.length > 0, `${lesson.id}: example has a heading`);
        assert.ok(block.prompt && block.prompt.length > 0, `${lesson.id}: example has a prompt`);
        assert.ok(Array.isArray(block.steps) && block.steps.length > 0, `${lesson.id}: example has steps`);
        assert.ok(block.answerDisplay && block.answerDisplay.length > 0, `${lesson.id}: example has an answerDisplay`);
      }
    }
  });

  QUnit.test("grade6-addSubtractFractions lesson: the hand-written example blocks' answers are actually correct", (assert) => {
    const lesson = getLessonById('grade6-addSubtractFractions');
    const examples = lesson.blocks.filter((b) => b.type === 'example');
    const expected = [
      { fractions: [{ num: 2, den: 6 }, { num: 3, den: 6 }], answerDisplay: '5/6' },
      { fractions: [{ num: 1, den: 4 }, { num: 1, den: 6 }], answerDisplay: '5/12' },
      { fractions: [{ num: 5, den: 6 }, { num: 1, den: 2 }], answerDisplay: '1 1/3' },
    ];
    assert.equal(examples.length, expected.length, 'expected exactly 3 worked examples in this lesson');
    examples.forEach((example, i) => {
      const [a, b] = expected[i].fractions;
      const sum = addFractions(a, b);
      assert.equal(formatMixedNumber(sum), expected[i].answerDisplay, `example ${i + 1} ("${example.prompt}"): a hand check of the math matches the expected answer`);
      assert.equal(example.answerDisplay, expected[i].answerDisplay, `example ${i + 1}: the lesson's own answerDisplay matches`);
    });
  });

  QUnit.test("grade6-multiplyFractions lesson: the hand-written example blocks' answers are actually correct", (assert) => {
    const examples = getLessonById('grade6-multiplyFractions').blocks.filter((b) => b.type === 'example');
    const expected = [
      { fractions: [{ num: 1, den: 2 }, { num: 1, den: 3 }], answerDisplay: '1/6' },
      { fractions: [{ num: 2, den: 3 }, { num: 3, den: 4 }], answerDisplay: '1/2' },
    ];
    assert.equal(examples.length, expected.length);
    examples.forEach((example, i) => {
      const [a, b] = expected[i].fractions;
      assert.equal(formatFraction(mulFractions(a, b)), expected[i].answerDisplay, `example ${i + 1} ("${example.prompt}")`);
      assert.equal(example.answerDisplay, expected[i].answerDisplay);
    });
  });

  QUnit.test("grade6-divideFractions lesson: the hand-written example blocks' answers are actually correct", (assert) => {
    const examples = getLessonById('grade6-divideFractions').blocks.filter((b) => b.type === 'example');
    const expected = [
      { fractions: [{ num: 1, den: 2 }, { num: 1, den: 4 }], answerDisplay: '2' },
      { fractions: [{ num: 2, den: 3 }, { num: 3, den: 5 }], answerDisplay: '1 1/9' },
    ];
    assert.equal(examples.length, expected.length);
    examples.forEach((example, i) => {
      const [a, b] = expected[i].fractions;
      assert.equal(formatMixedNumber(divFractions(a, b)), expected[i].answerDisplay, `example ${i + 1} ("${example.prompt}")`);
      assert.equal(example.answerDisplay, expected[i].answerDisplay);
    });
  });

  QUnit.test("grade6-multiplyDivideDecimals lesson: the hand-written example blocks' answers are actually correct", (assert) => {
    const examples = getLessonById('grade6-multiplyDivideDecimals').blocks.filter((b) => b.type === 'example');
    assert.equal(examples.length, 2);
    assert.equal(roundTo(0.3 * 0.4, 2).toFixed(2), examples[0].answerDisplay, `example 1 ("${examples[0].prompt}")`);
    assert.equal(roundTo(1.44 / 1.2, 2).toFixed(1), examples[1].answerDisplay, `example 2 ("${examples[1].prompt}")`);
  });

  QUnit.test("grade6-fractionDecimalConversion lesson: the hand-written example blocks' answers are actually correct", (assert) => {
    const examples = getLessonById('grade6-fractionDecimalConversion').blocks.filter((b) => b.type === 'example');
    assert.equal(examples.length, 2);
    assert.equal(roundTo(3 / 4, 4).toString(), examples[0].answerDisplay, `example 1 ("${examples[0].prompt}")`);
    assert.equal(formatFraction(reduceFraction(6, 10)), examples[1].answerDisplay, `example 2 ("${examples[1].prompt}")`);
  });

  QUnit.test('each checkpoint generator produces a working, self-consistent problem across many seeds', (assert) => {
    for (const lesson of LESSONS) {
      const mod = getById(lesson.generatorId);
      for (const block of lesson.blocks) {
        if (block.type !== 'checkpoint') continue;
        for (let seed = 0; seed < 40; seed++) {
          const rng = createRng(seed);
          const problem = mod.generate({ difficulty: block.difficulty, rng });
          assert.ok(problem.checkAnswer(problem.answerDisplay), `${lesson.id} [${block.difficulty}] seed ${seed}: checkAnswer accepts its own answer`);
          assert.equal(mod.explain(problem.meta).finalAnswerDisplay, problem.answerDisplay, `${lesson.id} [${block.difficulty}] seed ${seed}: explain() matches the generated answer`);
        }
      }
    }
  });
});
