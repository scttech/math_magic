import { getWordLists, addWord, removeWord, resetCategoryToDefaults, DEFAULT_WORD_LISTS } from '../../js/core/wordListStore.js';

QUnit.module('core/wordListStore', (hooks) => {
  hooks.beforeEach(() => localStorage.clear());

  QUnit.test('getWordLists seeds localStorage with defaults on first read', (assert) => {
    const lists = getWordLists();
    assert.deepEqual(lists, DEFAULT_WORD_LISTS);
    assert.ok(localStorage.getItem('mathmagic.wordLists'));
  });

  QUnit.test('addWord appends a new word to the given category', (assert) => {
    const lists = addWord('food', 'kiwi');
    assert.ok(lists.food.includes('kiwi'));
  });

  QUnit.test('addWord is case-insensitively deduped', (assert) => {
    addWord('food', 'Kiwi');
    const lists = addWord('food', 'kiwi');
    assert.equal(lists.food.filter((w) => w.toLowerCase() === 'kiwi').length, 1);
  });

  QUnit.test('addWord ignores blank input', (assert) => {
    const before = getWordLists();
    const after = addWord('food', '   ');
    assert.deepEqual(after, before);
  });

  QUnit.test('removeWord removes a word from a category', (assert) => {
    addWord('object', 'kite');
    const lists = removeWord('object', 'kite');
    assert.notOk(lists.object.includes('kite'));
  });

  QUnit.test('removeWord refuses to empty a category', (assert) => {
    let lists = getWordLists();
    for (const word of lists.object.slice(1)) {
      lists = removeWord('object', word);
    }
    assert.equal(lists.object.length, 1, 'stopped removing before the category was empty');
    const lastWord = lists.object[0];
    lists = removeWord('object', lastWord);
    assert.equal(lists.object.length, 1, 'the last word cannot be removed');
    assert.equal(lists.object[0], lastWord);
  });

  QUnit.test('resetCategoryToDefaults restores a category after edits', (assert) => {
    addWord('person', 'ExtraPerson');
    resetCategoryToDefaults('person');
    assert.deepEqual(getWordLists().person, DEFAULT_WORD_LISTS.person);
  });
});
