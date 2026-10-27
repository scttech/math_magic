import '../../js/generators/grade5/index.js';
import '../../js/generators/grade6/index.js';
import { getRecommendedPractice } from '../../js/app/recommendation.js';

function attempt({ grade = '6', topics, problems }) {
  return { attemptId: 'atmp_test', type: 'quiz', grade, topics, difficulty: 'medium', startedAt: '2026-01-01T00:00:00.000Z', completedAt: '2026-01-01T00:05:00.000Z', problems };
}

function problem(generatorId, correct) {
  return { generatorId, difficulty: 'medium', seed: 1, correct, userAnswer: 'x', timeMs: 1000 };
}

QUnit.module('app/recommendation', () => {
  QUnit.test('returns null when there are no attempts yet', (assert) => {
    assert.equal(getRecommendedPractice({ attempts: [] }), null);
  });

  QUnit.test('returns null when every topic has fewer than the minimum sample size', (assert) => {
    const progress = {
      attempts: [attempt({ topics: ['fractionsDecimals'], problems: [problem('grade6.fractionsDecimals.divideFractions', false)] })],
    };
    assert.equal(getRecommendedPractice(progress), null);
  });

  QUnit.test('recommends the topic with the lowest accuracy once it has enough data', (assert) => {
    const progress = {
      attempts: [
        attempt({
          topics: ['fractionsDecimals'],
          problems: [problem('grade6.fractionsDecimals.divideFractions', true), problem('grade6.fractionsDecimals.divideFractions', true), problem('grade6.fractionsDecimals.divideFractions', true)],
        }),
        attempt({
          topics: ['negativeNumbers'],
          problems: [problem('grade6.negativeNumbers.addSubtractIntegers', false), problem('grade6.negativeNumbers.addSubtractIntegers', false), problem('grade6.negativeNumbers.addSubtractIntegers', true)],
        }),
      ],
    };
    const result = getRecommendedPractice(progress);
    assert.equal(result.topic, 'negativeNumbers');
    assert.equal(result.total, 3);
    assert.ok(Math.abs(result.accuracy - 1 / 3) < 1e-9);
    assert.equal(result.url, 'quiz.html?grade=6&topic=negativeNumbers');
  });

  QUnit.test('uses the grade of the most recent attempt that practiced the recommended topic', (assert) => {
    const progress = {
      attempts: [
        attempt({ grade: '5', topics: ['coordinatePlane'], problems: [problem('grade5.coordinatePlane.identifyCoordinates', false), problem('grade5.coordinatePlane.identifyCoordinates', false), problem('grade5.coordinatePlane.identifyCoordinates', false)] }),
        attempt({ grade: '6', topics: ['coordinatePlane'], problems: [problem('grade6.coordinatePlane.identifyCoordinates', false)] }),
      ],
    };
    const result = getRecommendedPractice(progress);
    assert.equal(result.topic, 'coordinatePlane');
    assert.equal(result.url, 'quiz.html?grade=6&topic=coordinatePlane', 'uses the most recent attempt\'s grade, not the first');
  });

  QUnit.test('recommends a skill drill\'s own page, since skills have no grade', (assert) => {
    const progress = {
      attempts: [attempt({ grade: null, topics: ['additionFacts'], problems: [problem('skills.additionFacts', false), problem('skills.additionFacts', false), problem('skills.additionFacts', false)] })],
    };
    const result = getRecommendedPractice(progress);
    assert.equal(result.topic, 'additionFacts');
    assert.equal(result.url, 'skills-addition-facts.html');
  });
});
