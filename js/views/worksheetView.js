import '../app/init.js';
import { renderNav } from '../app/nav.js';
import { topicLabel } from '../app/topicLabels.js';
import { populateGradeSelect, populateTopicCheckboxes, getSelectedTopics } from '../app/topicPicker.js';
import { buildProblemSet } from '../core/problemSet.js';
import { randomSeed } from '../core/rng.js';
import { getActiveProfileId } from '../core/profileStore.js';
import { recordWorksheetGenerated } from '../core/progressStore.js';

const els = {};
let currentSeed = null;

function cacheElements() {
  els.setupSection = document.getElementById('worksheet-setup');
  els.outputSection = document.getElementById('worksheet-output');
  els.gradeSelect = document.getElementById('grade-select');
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
}

function populateTopics() {
  populateTopicCheckboxes(els.topicList, els.gradeSelect.value);
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

  els.setupSection.hidden = true;
  els.outputSection.hidden = false;
  els.answerKeyOutput.classList.remove('show-on-screen');
  els.toggleAnswerKeyBtn.textContent = 'Show Answer Key';
}

function renderWorksheet({ grade, topics, difficulty, problems }) {
  const topicNames = topics.map(topicLabel).join(', ');
  els.worksheetMeta.textContent = `Grade ${grade} · ${topicNames} · ${difficultyLabel(difficulty)} · Worksheet #${currentSeed}`;
  els.answerKeyTitle.textContent = `Answer Key — Worksheet #${currentSeed}`;

  els.worksheetProblems.innerHTML = problems
    .map((p) => `<li><span class="problem-text">${p.promptText}</span><span class="answer-blank"></span></li>`)
    .join('');

  els.worksheetAnswers.innerHTML = problems.map((p) => `<li>${p.answerDisplay}</li>`).join('');
}

function toggleAnswerKey() {
  const showing = els.answerKeyOutput.classList.toggle('show-on-screen');
  els.toggleAnswerKeyBtn.textContent = showing ? 'Hide Answer Key' : 'Show Answer Key';
}

function editSettings() {
  els.outputSection.hidden = true;
  els.setupSection.hidden = false;
}

export function init() {
  cacheElements();
  renderNav('worksheet.html');
  populateGradeSelect(els.gradeSelect);
  populateTopics();

  els.gradeSelect.addEventListener('change', populateTopics);
  els.topicList.addEventListener('change', updateGenerateEnabled);
  els.generateBtn.addEventListener('click', generateWorksheet);
  els.printBtn.addEventListener('click', () => window.print());
  els.toggleAnswerKeyBtn.addEventListener('click', toggleAnswerKey);
  els.editSettingsBtn.addEventListener('click', editSettings);
}
