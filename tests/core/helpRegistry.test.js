import { registerHelpProvider, hasHelp, buildHelpUrl } from '../../js/core/helpRegistry.js';

QUnit.module('core/helpRegistry', () => {
  QUnit.test('hasHelp is false for a generatorId with no registered provider', (assert) => {
    assert.notOk(hasHelp('nothing.registered.here'));
  });

  QUnit.test('registerHelpProvider makes hasHelp true and buildHelpUrl use the registered builder', (assert) => {
    registerHelpProvider('test.helpRegistry.fakeGenerator', (problem) => `help.html?fake=${problem.meta.difficulty}`);
    assert.ok(hasHelp('test.helpRegistry.fakeGenerator'));
    const url = buildHelpUrl({ meta: { generatorId: 'test.helpRegistry.fakeGenerator', difficulty: 'hard' } });
    assert.equal(url, 'help.html?fake=hard');
  });

  QUnit.test('buildHelpUrl returns null for a problem with no registered provider', (assert) => {
    assert.equal(buildHelpUrl({ meta: { generatorId: 'still.nothing.registered' } }), null);
  });
});
