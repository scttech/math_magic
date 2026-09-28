import { register, getById, getAll, getByGrade, getByTopic, listGrades, listTopics } from '../../js/core/registry.js';

// registry.js holds one module-level singleton shared by every test file
// loaded on the page (including the real grade-6 content registered via
// app/init.js), so these tests must never clear or mutate real entries.
// Everything here registers under a grade no real content ever uses.
const TEST_GRADE = '99-registry-test';

QUnit.module('core/registry', () => {
  QUnit.test('register + getById round-trips a module', (assert) => {
    const mod = { id: 'test.registry.roundtrip', grade: TEST_GRADE, topic: 'foo' };
    register(mod);
    assert.strictEqual(getById('test.registry.roundtrip'), mod);
  });

  QUnit.test('register throws on duplicate id', (assert) => {
    register({ id: 'test.registry.dup', grade: TEST_GRADE, topic: 'foo' });
    assert.throws(() => register({ id: 'test.registry.dup', grade: TEST_GRADE, topic: 'bar' }));
  });

  QUnit.test('register throws when module has no id', (assert) => {
    assert.throws(() => register({ grade: TEST_GRADE }));
  });

  QUnit.test('getByGrade / getByTopic filter correctly', (assert) => {
    register({ id: 'test.registry.filter.a', grade: TEST_GRADE, topic: 'fractions-test' });
    register({ id: 'test.registry.filter.b', grade: TEST_GRADE, topic: 'ratios-test' });

    const byGrade = getByGrade(TEST_GRADE).map((m) => m.id);
    assert.ok(byGrade.includes('test.registry.filter.a'));
    assert.ok(byGrade.includes('test.registry.filter.b'));
    assert.deepEqual(
      getByTopic(TEST_GRADE, 'fractions-test').map((m) => m.id),
      ['test.registry.filter.a']
    );
  });

  QUnit.test('listGrades includes a grade once any module is registered for it', (assert) => {
    register({ id: 'test.registry.listgrades', grade: TEST_GRADE, topic: 'x' });
    assert.ok(listGrades().includes(TEST_GRADE));
  });

  QUnit.test('listTopics lists topics registered for a grade', (assert) => {
    register({ id: 'test.registry.listtopics', grade: TEST_GRADE, topic: 'a-unique-topic' });
    assert.ok(listTopics(TEST_GRADE).includes('a-unique-topic'));
  });

  QUnit.test('getAll includes registered modules', (assert) => {
    register({ id: 'test.registry.getall', grade: TEST_GRADE, topic: 'x' });
    assert.ok(getAll().some((m) => m.id === 'test.registry.getall'));
  });

  QUnit.test('the real grade-6 content is present (sanity check that registry.js is the live shared instance)', (assert) => {
    assert.ok(getByGrade('6').length > 0, 'grade 6 has registered generators from app content, not just this test file');
  });
});
