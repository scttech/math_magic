import {
  listProfiles,
  getProfile,
  createProfile,
  createProfileWithId,
  renameProfile,
  deleteProfile,
  setProfileAvatar,
  getActiveProfileId,
  setActiveProfileId,
  getActiveProfile,
} from '../../js/core/profileStore.js';
import { recordQuizAttempt, getProgress } from '../../js/core/progressStore.js';

QUnit.module('core/profileStore', (hooks) => {
  hooks.beforeEach(() => localStorage.clear());

  QUnit.test('createProfile adds a profile with generated id and defaults', (assert) => {
    const profile = createProfile('Ari');
    assert.equal(profile.name, 'Ari');
    assert.ok(profile.id.startsWith('profile_'));
    assert.ok(profile.avatarColor);
    assert.equal(profile.avatarIcon, null);
    assert.ok(profile.createdAt);
    assert.deepEqual(listProfiles(), [profile]);
  });

  QUnit.test('createProfile accepts an optional avatar icon', (assert) => {
    const profile = createProfile('Ari', 'avatar-05.jpg');
    assert.equal(profile.avatarIcon, 'avatar-05.jpg');
  });

  QUnit.test('setProfileAvatar updates an existing profile and returns it', (assert) => {
    const profile = createProfile('Ari');
    const updated = setProfileAvatar(profile.id, 'avatar-12.jpg');
    assert.equal(updated.avatarIcon, 'avatar-12.jpg');
    assert.equal(getProfile(profile.id).avatarIcon, 'avatar-12.jpg');
  });

  QUnit.test('setProfileAvatar returns null for an unknown id', (assert) => {
    assert.equal(setProfileAvatar('nope', 'avatar-01.jpg'), null);
  });

  QUnit.test('the first profile ever created becomes active automatically', (assert) => {
    const profile = createProfile('Ari');
    assert.equal(getActiveProfileId(), profile.id);
  });

  QUnit.test('a second profile does not steal active status automatically', (assert) => {
    const first = createProfile('Ari');
    createProfile('Sam');
    assert.equal(getActiveProfileId(), first.id);
  });

  QUnit.test('getProfile looks up by id, returns null when missing', (assert) => {
    const profile = createProfile('Ari');
    assert.deepEqual(getProfile(profile.id), profile);
    assert.equal(getProfile('nope'), null);
  });

  QUnit.test('createProfileWithId rejects a duplicate id', (assert) => {
    createProfileWithId({ id: 'dup', name: 'Ari' });
    assert.throws(() => createProfileWithId({ id: 'dup', name: 'Sam' }));
  });

  QUnit.test('renameProfile updates the name and returns the updated profile', (assert) => {
    const profile = createProfile('Ari');
    const updated = renameProfile(profile.id, 'Ariana');
    assert.equal(updated.name, 'Ariana');
    assert.equal(getProfile(profile.id).name, 'Ariana');
  });

  QUnit.test('renameProfile returns null for an unknown id', (assert) => {
    assert.equal(renameProfile('nope', 'X'), null);
  });

  QUnit.test('deleteProfile removes the profile and its progress', (assert) => {
    const profile = createProfile('Ari');
    recordQuizAttempt(profile.id, { grade: '6', topics: ['fractionsDecimals'], difficulty: 'easy', startedAt: '', completedAt: '', problems: [] });
    assert.equal(getProgress(profile.id).attempts.length, 1);

    deleteProfile(profile.id);

    assert.equal(getProfile(profile.id), null);
    assert.equal(getProgress(profile.id).attempts.length, 0);
  });

  QUnit.test('deleting the active profile falls back to another remaining profile', (assert) => {
    const first = createProfile('Ari');
    const second = createProfile('Sam');
    setActiveProfileId(first.id);

    deleteProfile(first.id);

    assert.equal(getActiveProfileId(), second.id);
  });

  QUnit.test('deleting the last profile clears the active profile', (assert) => {
    const only = createProfile('Ari');
    deleteProfile(only.id);
    assert.equal(getActiveProfileId(), null);
    assert.equal(getActiveProfile(), null);
  });

  QUnit.test('setActiveProfileId(null) clears the active profile', (assert) => {
    const profile = createProfile('Ari');
    setActiveProfileId(null);
    assert.equal(getActiveProfileId(), null);
    assert.equal(getActiveProfile(), null);
    assert.ok(profile.id, 'sanity: profile was actually created');
  });
});
