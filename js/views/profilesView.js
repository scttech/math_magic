import '../app/init.js';
import { renderNav } from '../app/nav.js';
import {
  listProfiles,
  createProfile,
  renameProfile,
  deleteProfile,
  setProfileAvatar,
  getActiveProfileId,
  setActiveProfileId,
} from '../core/profileStore.js';
import { downloadExport, parseImportText, mergeImportedDocument } from '../core/importExport.js';
import { AVATAR_ICONS, avatarIconUrl } from '../app/avatars.js';

const els = {};
let selectedNewAvatarIcon = null;
let editingAvatarForId = null;

function cacheElements() {
  els.profileList = document.getElementById('profile-list');
  els.newProfileForm = document.getElementById('new-profile-form');
  els.newProfileName = document.getElementById('new-profile-name');
  els.newProfileAvatarPicker = document.getElementById('new-profile-avatar-picker');
  els.exportBtn = document.getElementById('export-btn');
  els.importInput = document.getElementById('import-input');
  els.importStatus = document.getElementById('import-status');
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function avatarOptionsHtml(selectedIcon) {
  return AVATAR_ICONS.map(
    (icon) => `
      <button type="button" class="avatar-option ${icon === selectedIcon ? 'selected' : ''}" data-icon="${icon}" aria-label="Choose this avatar" aria-pressed="${icon === selectedIcon}">
        <img src="${avatarIconUrl(icon)}" alt="" loading="lazy" />
      </button>`
  ).join('');
}

function avatarBadgeHtml(profile) {
  return profile.avatarIcon
    ? `<img class="avatar-thumb" src="${avatarIconUrl(profile.avatarIcon)}" alt="" />`
    : `<span class="avatar-dot" style="background:${profile.avatarColor}"></span>`;
}

function renderNewProfileAvatarPicker() {
  els.newProfileAvatarPicker.innerHTML = avatarOptionsHtml(selectedNewAvatarIcon);
}

function renderProfiles() {
  // Re-render the nav too — it shows the active profile's name/avatar, which
  // any create/switch/rename/delete/avatar-change below can affect.
  renderNav('profiles.html');

  const profiles = listProfiles();
  const activeId = getActiveProfileId();
  els.profileList.innerHTML = profiles
    .map((p) => {
      const isActive = p.id === activeId;
      const editingThis = editingAvatarForId === p.id;
      return `
        <li class="profile-card ${isActive ? 'active' : ''}">
          <div class="profile-card-row">
            ${avatarBadgeHtml(p)}
            <span class="profile-name">${escapeHtml(p.name)}</span>
            ${isActive ? '<span class="badge correct">Active</span>' : `<button type="button" class="btn secondary switch-btn" data-id="${p.id}">Switch</button>`}
            <button type="button" class="btn secondary change-avatar-btn" data-id="${p.id}">${editingThis ? 'Cancel' : 'Change Avatar'}</button>
            <button type="button" class="btn secondary rename-btn" data-id="${p.id}">Rename</button>
            <button type="button" class="btn secondary delete-btn" data-id="${p.id}">Delete</button>
          </div>
          ${editingThis ? `<div class="avatar-picker" data-id="${p.id}">${avatarOptionsHtml(p.avatarIcon)}</div>` : ''}
        </li>`;
    })
    .join('');
}

function handleProfileListClick(event) {
  const target = event.target.closest('button');
  if (!target) return;
  const id = target.dataset.id;

  if (target.classList.contains('avatar-option')) {
    const picker = target.closest('.avatar-picker');
    const profileId = picker?.dataset.id;
    if (!profileId) return;
    setProfileAvatar(profileId, target.dataset.icon);
    editingAvatarForId = null;
    renderProfiles();
    return;
  }

  if (!id) return;

  if (target.classList.contains('change-avatar-btn')) {
    editingAvatarForId = editingAvatarForId === id ? null : id;
    renderProfiles();
  } else if (target.classList.contains('switch-btn')) {
    setActiveProfileId(id);
    renderProfiles();
  } else if (target.classList.contains('rename-btn')) {
    const profile = listProfiles().find((p) => p.id === id);
    const name = window.prompt('Rename profile', profile ? profile.name : '');
    if (name && name.trim()) {
      renameProfile(id, name.trim());
      renderProfiles();
    }
  } else if (target.classList.contains('delete-btn')) {
    const profile = listProfiles().find((p) => p.id === id);
    const confirmed = window.confirm(`Delete profile "${profile ? profile.name : ''}"? This also deletes their saved progress. This can't be undone.`);
    if (confirmed) {
      deleteProfile(id);
      if (listProfiles().length === 0) {
        const fresh = createProfile('Player 1');
        setActiveProfileId(fresh.id);
      }
      renderProfiles();
    }
  }
}

function handleNewProfileAvatarPickerClick(event) {
  const target = event.target.closest('.avatar-option');
  if (!target) return;
  selectedNewAvatarIcon = target.dataset.icon;
  renderNewProfileAvatarPicker();
}

function handleNewProfileSubmit(event) {
  event.preventDefault();
  const name = els.newProfileName.value.trim();
  if (!name) return;
  const profile = createProfile(name, selectedNewAvatarIcon);
  setActiveProfileId(profile.id);
  els.newProfileName.value = '';
  selectedNewAvatarIcon = null;
  renderNewProfileAvatarPicker();
  renderProfiles();
}

function showImportStatus(message, kind) {
  els.importStatus.textContent = message;
  els.importStatus.className = `feedback ${kind}`;
  els.importStatus.hidden = false;
}

async function handleImportChange() {
  const file = els.importInput.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const doc = parseImportText(text);
    const summary = mergeImportedDocument(doc);
    showImportStatus(
      `Imported: ${summary.profilesCreated} new profile(s), ${summary.profilesUpdated} updated, ${summary.attemptsAdded} quiz attempt(s) and ${summary.worksheetsAdded} worksheet(s) added.`,
      'correct'
    );
    renderProfiles();
  } catch (err) {
    showImportStatus(`Import failed: ${err.message}`, 'incorrect');
  }
  els.importInput.value = '';
}

export function init() {
  cacheElements();
  renderProfiles();
  renderNewProfileAvatarPicker();

  els.profileList.addEventListener('click', handleProfileListClick);
  els.newProfileAvatarPicker.addEventListener('click', handleNewProfileAvatarPickerClick);
  els.newProfileForm.addEventListener('submit', handleNewProfileSubmit);
  els.exportBtn.addEventListener('click', () => downloadExport());
  els.importInput.addEventListener('change', handleImportChange);
}
