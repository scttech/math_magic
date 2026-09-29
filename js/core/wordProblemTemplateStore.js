// User-added word-problem templates. Built-in templates ship in code
// (wordProblemPatterns.js's defaultTemplates) and are never stored here, so
// they can't be lost and picking up new ones just means updating the site.
// Shared across every profile in the browser, like the word lists.
import { generateId } from './id.js';
import { getPatternById } from './wordProblemPatterns.js';
import { validateTemplateText } from './wordProblemTemplateEngine.js';

const TEMPLATES_KEY = 'mathmagic.wordProblemTemplates';

function readTemplates() {
  try {
    const raw = JSON.parse(localStorage.getItem(TEMPLATES_KEY));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function writeTemplates(templates) {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

export function listUserTemplates() {
  return readTemplates();
}

export function listUserTemplatesForPattern(patternId) {
  return readTemplates().filter((t) => t.patternId === patternId);
}

/** Validates text against the pattern's required roles, then saves it. Throws on invalid input. */
export function addUserTemplate({ patternId, text }) {
  const pattern = getPatternById(patternId);
  if (!pattern) {
    throw new Error(`Unknown word-problem pattern "${patternId}".`);
  }
  const trimmed = (text || '').trim();
  const { valid, errors } = validateTemplateText(trimmed, pattern);
  if (!valid) {
    throw new Error(errors.join(' '));
  }

  const templates = readTemplates();
  const template = { templateId: generateId('wtpl'), patternId, text: trimmed, createdAt: new Date().toISOString() };
  templates.push(template);
  writeTemplates(templates);
  return template;
}

export function deleteUserTemplate(templateId) {
  writeTemplates(readTemplates().filter((t) => t.templateId !== templateId));
}
