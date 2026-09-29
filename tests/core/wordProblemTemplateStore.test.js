import { addUserTemplate, listUserTemplates, listUserTemplatesForPattern, deleteUserTemplate } from '../../js/core/wordProblemTemplateStore.js';

const VALID_TEXT =
  '<person> has <mixed_number:start> pounds of <food> at home, then buys an additional <mixed_number:gained> pounds at the store. <person> consumes <mixed_number:consumed> pounds of <food> over the week. How many pounds of <food> does <person> have left?';

QUnit.module('core/wordProblemTemplateStore', (hooks) => {
  hooks.beforeEach(() => localStorage.clear());

  QUnit.test('addUserTemplate saves a valid template with a generated id', (assert) => {
    const template = addUserTemplate({ patternId: 'combineThenRemove', text: VALID_TEXT });
    assert.ok(template.templateId.startsWith('wtpl_'));
    assert.equal(template.patternId, 'combineThenRemove');
    assert.deepEqual(listUserTemplates(), [template]);
  });

  QUnit.test('addUserTemplate rejects an unknown pattern id', (assert) => {
    assert.throws(() => addUserTemplate({ patternId: 'nope', text: VALID_TEXT }));
  });

  QUnit.test('addUserTemplate rejects text missing a required role', (assert) => {
    assert.throws(() => addUserTemplate({ patternId: 'combineThenRemove', text: '<person> has some <food>.' }));
  });

  QUnit.test('listUserTemplatesForPattern filters by pattern', (assert) => {
    addUserTemplate({ patternId: 'combineThenRemove', text: VALID_TEXT });
    assert.equal(listUserTemplatesForPattern('combineThenRemove').length, 1);
    assert.equal(listUserTemplatesForPattern('multiplyRate').length, 0);
  });

  QUnit.test('deleteUserTemplate removes a template by id', (assert) => {
    const template = addUserTemplate({ patternId: 'combineThenRemove', text: VALID_TEXT });
    deleteUserTemplate(template.templateId);
    assert.deepEqual(listUserTemplates(), []);
  });
});
