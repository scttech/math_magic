import { determineWinner } from '../../js/app/duelScoring.js';

QUnit.module('app/duelScoring', () => {
  QUnit.test('determineWinner picks the higher score', (assert) => {
    assert.equal(determineWinner(5, 3), 'a');
    assert.equal(determineWinner(2, 7), 'b');
  });

  QUnit.test('determineWinner returns a tie when scores are equal', (assert) => {
    assert.equal(determineWinner(4, 4), 'tie');
    assert.equal(determineWinner(0, 0), 'tie');
  });
});
