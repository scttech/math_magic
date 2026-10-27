import { buildDeck } from '../../js/app/memoryDeck.js';

function fakeTopic(sequence) {
  let index = 0;
  return {
    args: [],
    generate: () => sequence[index++ % sequence.length],
  };
}

QUnit.module('app/memoryDeck', () => {
  QUnit.test('buildDeck returns the requested number of problems when enough unique ones are available', (assert) => {
    const topic = fakeTopic([
      { promptText: '1+1', answerDisplay: '2' },
      { promptText: '2+2', answerDisplay: '4' },
      { promptText: '3+3', answerDisplay: '6' },
    ]);
    const deck = buildDeck(topic, 3, 0);
    assert.equal(deck.length, 3);
  });

  QUnit.test('buildDeck skips problems whose prompt OR answer collides with one already in the deck', (assert) => {
    const topic = fakeTopic([
      { promptText: '1+1', answerDisplay: '2' },
      { promptText: '1+1', answerDisplay: '2' }, // exact duplicate
      { promptText: '0+2', answerDisplay: '2' }, // different prompt, colliding answer
      { promptText: '2+2', answerDisplay: '2' }, // different prompt, colliding answer
      { promptText: '2+2', answerDisplay: '4' }, // finally unique on both counts
    ]);
    const deck = buildDeck(topic, 2, 0);
    assert.equal(deck.length, 2);
    assert.deepEqual(
      deck.map((p) => p.promptText),
      ['1+1', '2+2']
    );
  });

  QUnit.test('buildDeck returns fewer than requested if the topic cannot produce enough unique pairs', (assert) => {
    const topic = fakeTopic([{ promptText: 'only one', answerDisplay: 'x' }]);
    const deck = buildDeck(topic, 5, 0);
    assert.equal(deck.length, 1);
  });

  QUnit.test('buildDeck is deterministic for a given base seed', (assert) => {
    // Prompt and answer both derive from the seeded rng, so each seed offset's
    // fresh createRng() draw gives a distinct (and reproducible) pair.
    const topic = { args: [], generate: (rng) => ({ promptText: `p${rng()}`, answerDisplay: `a${rng()}` }) };
    const a = buildDeck(topic, 3, 42);
    const b = buildDeck(topic, 3, 42);
    assert.deepEqual(a, b);
    assert.equal(a.length, 3);
  });
});
