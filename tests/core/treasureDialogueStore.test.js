import {
  getDialogueLines,
  addDialogueLine,
  removeDialogueLine,
  resetCategoryToDefaults,
  DEFAULT_DIALOGUE,
  TREASURE_DIALOGUE_CATEGORIES,
} from '../../js/core/treasureDialogueStore.js';

QUnit.module('core/treasureDialogueStore', (hooks) => {
  hooks.beforeEach(() => localStorage.clear());

  QUnit.test('getDialogueLines seeds localStorage with defaults on first read', (assert) => {
    const lines = getDialogueLines();
    assert.deepEqual(lines, DEFAULT_DIALOGUE);
    assert.ok(localStorage.getItem('mathmagic.treasureDialogue'));
  });

  QUnit.test('TREASURE_DIALOGUE_CATEGORIES covers exactly the two intro slides', (assert) => {
    assert.deepEqual(TREASURE_DIALOGUE_CATEGORIES.slice().sort(), ['map', 'ship']);
  });

  QUnit.test('addDialogueLine appends a new line to the given category', (assert) => {
    const lines = addDialogueLine('ship', 'Yarrr, a new tale to tell!');
    assert.ok(lines.ship.includes('Yarrr, a new tale to tell!'));
  });

  QUnit.test('addDialogueLine is case-insensitively deduped', (assert) => {
    addDialogueLine('ship', 'Ahoy there!');
    const lines = addDialogueLine('ship', 'ahoy there!');
    assert.equal(lines.ship.filter((l) => l.toLowerCase() === 'ahoy there!').length, 1);
  });

  QUnit.test('addDialogueLine ignores blank input', (assert) => {
    const before = getDialogueLines();
    const after = addDialogueLine('ship', '   ');
    assert.deepEqual(after, before);
  });

  QUnit.test('removeDialogueLine removes a line from a category', (assert) => {
    addDialogueLine('map', 'A fresh riddle for the crew.');
    const lines = removeDialogueLine('map', 'A fresh riddle for the crew.');
    assert.notOk(lines.map.includes('A fresh riddle for the crew.'));
  });

  QUnit.test('removeDialogueLine refuses to empty a category', (assert) => {
    let lines = getDialogueLines();
    for (const line of lines.map.slice(1)) {
      lines = removeDialogueLine('map', line);
    }
    assert.equal(lines.map.length, 1, 'stopped removing before the category was empty');
    const lastLine = lines.map[0];
    lines = removeDialogueLine('map', lastLine);
    assert.equal(lines.map.length, 1, 'the last line cannot be removed');
    assert.equal(lines.map[0], lastLine);
  });

  QUnit.test('resetCategoryToDefaults restores a category after edits', (assert) => {
    addDialogueLine('ship', 'A one-off test line.');
    resetCategoryToDefaults('ship');
    assert.deepEqual(getDialogueLines().ship, DEFAULT_DIALOGUE.ship);
  });

  QUnit.test('an unknown category is a no-op', (assert) => {
    const before = getDialogueLines();
    assert.deepEqual(addDialogueLine('crew', 'test'), before);
    assert.deepEqual(removeDialogueLine('crew', 'test'), before);
    assert.deepEqual(resetCategoryToDefaults('crew'), before);
  });
});
