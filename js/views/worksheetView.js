import '../app/init.js';
import { renderNav } from '../app/nav.js';
import { topicLabel } from '../app/topicLabels.js';
import { populateGradeSelect, populateTopicCheckboxes, getSelectedTopics, syncSelectAllCheckbox, wireSelectAllToggle } from '../app/topicPicker.js';
import { buildProblemSet } from '../core/problemSet.js';
import { randomSeed } from '../core/rng.js';
import { getActiveProfileId } from '../core/profileStore.js';
import { recordWorksheetGenerated } from '../core/progressStore.js';
import { findWorksheetBySeed } from '../core/worksheetLookup.js';
import { renderVisual } from '../charts/renderVisual.js';
import { linkifyGlossaryTerms } from '../app/glossary.js';

const els = {};
let currentSeed = null;

function cacheElements() {
  els.setupSection = document.getElementById('worksheet-setup');
  els.lookupSection = document.getElementById('worksheet-lookup');
  els.outputSection = document.getElementById('worksheet-output');
  els.gradeSelect = document.getElementById('grade-select');
  els.selectAllTopics = document.getElementById('select-all-topics');
  els.topicList = document.getElementById('topic-checkboxes');
  els.difficultySelect = document.getElementById('difficulty-select');
  els.countSelect = document.getElementById('count-select');
  els.generateBtn = document.getElementById('generate-worksheet-btn');
  els.worksheetMeta = document.getElementById('worksheet-meta');
  els.worksheetProblems = document.getElementById('worksheet-problems');
  els.answerKeyTitle = document.getElementById('answer-key-title');
  els.worksheetAnswers = document.getElementById('worksheet-answers');
  els.answerKeyOutput = document.getElementById('answer-key-output');
  els.printBtn = document.getElementById('print-btn');
  els.toggleAnswerKeyBtn = document.getElementById('toggle-answer-key-btn');
  els.editSettingsBtn = document.getElementById('edit-settings-btn');

  els.showLookupLink = document.getElementById('show-lookup-link');
  els.lookupBackLink = document.getElementById('lookup-back-link');
  els.lookupSeedInput = document.getElementById('lookup-seed-input');
  els.lookupFindBtn = document.getElementById('lookup-find-btn');
  els.lookupStatus = document.getElementById('lookup-status');
  els.lookupManualFields = document.getElementById('lookup-manual-fields');
  els.lookupGradeSelect = document.getElementById('lookup-grade-select');
  els.lookupSelectAllTopics = document.getElementById('lookup-select-all-topics');
  els.lookupTopicList = document.getElementById('lookup-topic-checkboxes');
  els.lookupDifficultySelect = document.getElementById('lookup-difficulty-select');
  els.lookupCountSelect = document.getElementById('lookup-count-select');
  els.lookupGenerateBtn = document.getElementById('lookup-generate-btn');
}

function populateTopics() {
  populateTopicCheckboxes(els.topicList, els.gradeSelect.value);
  syncSelectAllCheckbox(els.selectAllTopics, els.topicList);
  updateGenerateEnabled();
}

function updateGenerateEnabled() {
  els.generateBtn.disabled = getSelectedTopics(els.topicList).length === 0;
}

function difficultyLabel(difficulty) {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

function generateWorksheet() {
  const grade = els.gradeSelect.value;
  const topics = getSelectedTopics(els.topicList);
  const difficulty = els.difficultySelect.value;
  const count = Number(els.countSelect.value);
  currentSeed = randomSeed();

  const problems = buildProblemSet({ grade, topics, difficulty, count, seed: currentSeed });
  renderWorksheet({ grade, topics, difficulty, problems });
  recordWorksheetGenerated(getActiveProfileId(), { grade, topics, difficulty, problemCount: count, seed: currentSeed });

  showOutput({ answerKeyVisible: false });
}

function renderWorksheet({ grade, topics, difficulty, problems }) {
  const topicNames = topics.map(topicLabel).join(', ');
  els.worksheetMeta.textContent = `Grade ${grade} · ${topicNames} · ${difficultyLabel(difficulty)} · Worksheet #${currentSeed}`;
  els.answerKeyTitle.textContent = `Answer Key — Worksheet #${currentSeed}`;

  els.worksheetProblems.innerHTML = problems
    .map((p, i) => {
      const gridHtml = p.visual ? `<div class="coordinate-plane-grid" id="worksheet-grid-${i}"></div>` : '';
      return `<li><span class="problem-text">${linkifyGlossaryTerms(p.promptText)}</span>${gridHtml}<span class="answer-blank"></span></li>`;
    })
    .join('');

  els.worksheetAnswers.innerHTML = problems
    .map((p, i) => {
      const answerGridHtml = p.visual && p.visual.answerVisual ? `<div class="coordinate-plane-grid" id="worksheet-answer-grid-${i}"></div>` : '';
      return `<li>${p.answerDisplay}${answerGridHtml}</li>`;
    })
    .join('');

  problems.forEach((p, i) => {
    if (!p.visual) return;
    // Interactive problems (e.g. plotting a point) print as a blank grid to fill in by hand; every other
    // visual problem shows the same populated grid on paper as it does on screen, since it's read-only there too.
    const problemVisual = p.visual.interactive ? { type: p.visual.type, range: p.visual.range, quadrant1: p.visual.quadrant1 } : p.visual;
    renderVisual(document.getElementById(`worksheet-grid-${i}`), problemVisual);
    if (p.visual.answerVisual) {
      renderVisual(document.getElementById(`worksheet-answer-grid-${i}`), p.visual.answerVisual);
    }
  });
}

function showOutput({ answerKeyVisible }) {
  els.setupSection.hidden = true;
  els.lookupSection.hidden = true;
  els.outputSection.hidden = false;
  els.answerKeyOutput.classList.toggle('show-on-screen', answerKeyVisible);
  els.toggleAnswerKeyBtn.textContent = answerKeyVisible ? 'Hide Answer Key' : 'Show Answer Key';
}

function toggleAnswerKey() {
  const showing = els.answerKeyOutput.classList.toggle('show-on-screen');
  els.toggleAnswerKeyBtn.textContent = showing ? 'Hide Answer Key' : 'Show Answer Key';
}

function editSettings() {
  els.outputSection.hidden = true;
  els.setupSection.hidden = false;
}

// --- Looking up a past worksheet's answer key --------------------------------

/** Parses a worksheet-number input into the non-negative integer seed it represents, or null if invalid. */
function parseSeedInput(raw) {
  const trimmed = (raw || '').trim().replace(/^#/, '');
  if (!/^\d+$/.test(trimmed)) return null;
  const seed = Number(trimmed);
  return Number.isSafeInteger(seed) ? seed : null;
}

function showLookupStatus(message, kind) {
  els.lookupStatus.hidden = false;
  els.lookupStatus.className = `feedback ${kind}`;
  els.lookupStatus.textContent = message;
}

function showLookup() {
  els.setupSection.hidden = true;
  els.lookupSection.hidden = false;
  els.lookupSeedInput.value = '';
  els.lookupStatus.hidden = true;
  els.lookupManualFields.hidden = true;
  els.lookupSeedInput.focus();
}

function backToSetupFromLookup() {
  els.lookupSection.hidden = true;
  els.setupSection.hidden = false;
}

function populateLookupTopics() {
  populateTopicCheckboxes(els.lookupTopicList, els.lookupGradeSelect.value);
  syncSelectAllCheckbox(els.lookupSelectAllTopics, els.lookupTopicList);
}

function handleFindAnswerKey() {
  const seed = parseSeedInput(els.lookupSeedInput.value);
  if (seed === null) {
    showLookupStatus('That doesn’t look like a worksheet number — it should be a number, like 408378565.', 'incorrect');
    els.lookupManualFields.hidden = true;
    return;
  }

  const found = findWorksheetBySeed(seed);
  if (!found) {
    showLookupStatus(
      'Not found in this browser’s history. Enter the worksheet’s original settings below — they’re printed right on the worksheet itself, next to the worksheet number.',
      'incorrect'
    );
    els.lookupManualFields.hidden = false;
    return;
  }

  currentSeed = seed;
  const problems = buildProblemSet({ grade: found.grade, topics: found.topics, difficulty: found.difficulty, count: found.problemCount, seed });
  renderWorksheet({ grade: found.grade, topics: found.topics, difficulty: found.difficulty, problems });
  showOutput({ answerKeyVisible: true });
}

function handleManualGenerate() {
  const seed = parseSeedInput(els.lookupSeedInput.value);
  if (seed === null) {
    showLookupStatus('That doesn’t look like a worksheet number — it should be a number, like 408378565.', 'incorrect');
    return;
  }
  const topics = getSelectedTopics(els.lookupTopicList);
  if (topics.length === 0) {
    showLookupStatus('Select at least one topic.', 'incorrect');
    return;
  }

  const grade = els.lookupGradeSelect.value;
  const difficulty = els.lookupDifficultySelect.value;
  const count = Number(els.lookupCountSelect.value);

  currentSeed = seed;
  const problems = buildProblemSet({ grade, topics, difficulty, count, seed });
  renderWorksheet({ grade, topics, difficulty, problems });
  showOutput({ answerKeyVisible: true });
}

export function init() {
  cacheElements();
  renderNav('worksheet.html');
  populateGradeSelect(els.gradeSelect);
  populateTopics();
  populateGradeSelect(els.lookupGradeSelect);
  populateLookupTopics();

  wireSelectAllToggle(els.selectAllTopics, els.topicList);
  els.gradeSelect.addEventListener('change', populateTopics);
  els.topicList.addEventListener('change', updateGenerateEnabled);
  els.generateBtn.addEventListener('click', generateWorksheet);
  els.printBtn.addEventListener('click', () => window.print());
  els.toggleAnswerKeyBtn.addEventListener('click', toggleAnswerKey);
  els.editSettingsBtn.addEventListener('click', editSettings);

  wireSelectAllToggle(els.lookupSelectAllTopics, els.lookupTopicList);
  els.lookupGradeSelect.addEventListener('change', populateLookupTopics);
  els.showLookupLink.addEventListener('click', (event) => {
    event.preventDefault();
    showLookup();
  });
  els.lookupBackLink.addEventListener('click', (event) => {
    event.preventDefault();
    backToSetupFromLookup();
  });
  els.lookupFindBtn.addEventListener('click', handleFindAnswerKey);
  els.lookupGenerateBtn.addEventListener('click', handleManualGenerate);
}
