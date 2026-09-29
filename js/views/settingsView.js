import '../app/init.js';
import { renderNav } from '../app/nav.js';
import { getWordLists, addWord, removeWord, resetCategoryToDefaults, WORD_LIST_CATEGORIES } from '../core/wordListStore.js';
import { WORD_PROBLEM_PATTERNS, getPatternById } from '../core/wordProblemPatterns.js';
import { listUserTemplatesForPattern, addUserTemplate, deleteUserTemplate } from '../core/wordProblemTemplateStore.js';
import { validateTemplateText, renderTemplate } from '../core/wordProblemTemplateEngine.js';
import { createRng, randomSeed } from '../core/rng.js';

const CATEGORY_LABELS = { person: 'People', food: 'Foods', object: 'Objects' };
const CATEGORY_SINGULAR = { person: 'person', food: 'food', object: 'object' };

const els = {};

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function cacheElements() {
  els.wordListGroups = document.getElementById('word-list-groups');
  els.templateList = document.getElementById('template-list');
  els.patternSelect = document.getElementById('template-pattern-select');
  els.patternReference = document.getElementById('pattern-reference');
  els.templateText = document.getElementById('template-text-input');
  els.templateError = document.getElementById('template-error');
  els.previewBtn = document.getElementById('template-preview-btn');
  els.saveBtn = document.getElementById('template-save-btn');
  els.previewBox = document.getElementById('template-preview');
}

// --- Word lists -------------------------------------------------------

function renderWordLists() {
  const lists = getWordLists();
  els.wordListGroups.innerHTML = WORD_LIST_CATEGORIES.map((category) => {
    const chips = lists[category]
      .map(
        (word) => `
        <span class="chip">
          ${escapeHtml(word)}
          <button type="button" class="chip-remove" data-category="${category}" data-word="${escapeHtml(word)}" aria-label="Remove ${escapeHtml(word)}">&times;</button>
        </span>`
      )
      .join('');
    return `
      <fieldset class="word-list-group">
        <legend>${CATEGORY_LABELS[category]}</legend>
        <div class="chip-list">${chips}</div>
        <form class="add-word-form" data-category="${category}">
          <input type="text" class="add-word-input" autocomplete="off" placeholder="Add a ${CATEGORY_SINGULAR[category]}" />
          <button type="submit" class="btn secondary">Add</button>
          <button type="button" class="btn secondary reset-category-btn" data-category="${category}">Reset to Defaults</button>
        </form>
      </fieldset>`;
  }).join('');
}

function handleWordListGroupsClick(event) {
  const removeBtn = event.target.closest('.chip-remove');
  if (removeBtn) {
    removeWord(removeBtn.dataset.category, removeBtn.dataset.word);
    renderWordLists();
    return;
  }
  const resetBtn = event.target.closest('.reset-category-btn');
  if (resetBtn) {
    const label = CATEGORY_LABELS[resetBtn.dataset.category];
    if (window.confirm(`Reset "${label}" to the default list? Any words you added or removed in this category will be lost.`)) {
      resetCategoryToDefaults(resetBtn.dataset.category);
      renderWordLists();
    }
  }
}

function handleWordListGroupsSubmit(event) {
  const form = event.target.closest('.add-word-form');
  if (!form) return;
  event.preventDefault();
  const input = form.querySelector('.add-word-input');
  if (!input.value.trim()) return;
  addWord(form.dataset.category, input.value);
  renderWordLists();
}

// --- Templates ----------------------------------------------------------

function renderTemplateList() {
  els.templateList.innerHTML = WORD_PROBLEM_PATTERNS.map((pattern) => {
    const builtIns = pattern.defaultTemplates
      .map((text) => `<li class="template-item"><span class="badge">Built-in</span> ${escapeHtml(text)}</li>`)
      .join('');
    const userOnes = listUserTemplatesForPattern(pattern.id)
      .map(
        (t) => `
        <li class="template-item">
          ${escapeHtml(t.text)}
          <button type="button" class="btn secondary delete-template-btn" data-id="${t.templateId}">Delete</button>
        </li>`
      )
      .join('');
    return `
      <div class="template-group">
        <h3>${escapeHtml(pattern.label)}</h3>
        <ul class="template-list">${builtIns}${userOnes}</ul>
      </div>`;
  }).join('');
}

function handleTemplateListClick(event) {
  const deleteBtn = event.target.closest('.delete-template-btn');
  if (!deleteBtn) return;
  deleteUserTemplate(deleteBtn.dataset.id);
  renderTemplateList();
}

function roleTagExample(role) {
  if (role.type === 'random_number') {
    const [min, max] = role.exampleRange || [1, 10];
    return `&lt;random_number_${min}_to_${max}:${role.name}&gt;`;
  }
  return `&lt;${role.type}:${role.name}&gt;`;
}

function renderPatternReference() {
  const pattern = getPatternById(els.patternSelect.value);
  if (!pattern) {
    els.patternReference.innerHTML = '';
    return;
  }
  const roleItems = pattern.requiredRoles.map((role) => `<li><code>${roleTagExample(role)}</code> — ${escapeHtml(role.hint || role.name)}</li>`).join('');
  els.patternReference.innerHTML = `
    <p>${escapeHtml(pattern.description)}</p>
    <p>Required tags for this problem type (you can also use <code>&lt;person&gt;</code>, <code>&lt;food&gt;</code>, or <code>&lt;object&gt;</code> anywhere for flavor):</p>
    <ul>${roleItems}</ul>
    <p class="progress-text">Example: ${escapeHtml(pattern.defaultTemplates[0])}</p>`;
}

function populatePatternSelect() {
  els.patternSelect.innerHTML = WORD_PROBLEM_PATTERNS.map((p) => `<option value="${p.id}">${escapeHtml(p.label)}</option>`).join('');
  renderPatternReference();
}

function showTemplateError(message) {
  els.templateError.textContent = message;
  els.templateError.hidden = false;
}

function hideTemplateError() {
  els.templateError.hidden = true;
}

function handlePreview() {
  const pattern = getPatternById(els.patternSelect.value);
  const text = els.templateText.value;
  const { valid, errors } = validateTemplateText(text, pattern);
  if (!valid) {
    showTemplateError(errors.join(' '));
    els.previewBox.hidden = true;
    return;
  }
  hideTemplateError();

  const rng = createRng(randomSeed());
  const wordLists = getWordLists();
  const { promptText, answerDisplay } = renderTemplate({ text: text.trim(), pattern, rng, difficulty: 'medium', wordLists });
  els.previewBox.hidden = false;
  els.previewBox.innerHTML = `<p><strong>Preview:</strong> ${escapeHtml(promptText)}</p><p class="progress-text">Answer: ${escapeHtml(answerDisplay)}</p>`;
}

function handleSave() {
  const patternId = els.patternSelect.value;
  const text = els.templateText.value;
  try {
    addUserTemplate({ patternId, text });
    els.templateText.value = '';
    els.previewBox.hidden = true;
    hideTemplateError();
    renderTemplateList();
  } catch (err) {
    showTemplateError(err.message);
  }
}

export function init() {
  cacheElements();
  renderNav('settings.html');
  renderWordLists();
  populatePatternSelect();
  renderTemplateList();

  els.wordListGroups.addEventListener('click', handleWordListGroupsClick);
  els.wordListGroups.addEventListener('submit', handleWordListGroupsSubmit);
  els.templateList.addEventListener('click', handleTemplateListClick);
  els.patternSelect.addEventListener('change', renderPatternReference);
  els.previewBtn.addEventListener('click', handlePreview);
  els.saveBtn.addEventListener('click', handleSave);
}
