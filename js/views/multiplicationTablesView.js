import '../app/init.js';
import { renderNav } from '../app/nav.js';
import { createRng, randomSeed } from '../core/rng.js';
import { getActiveProfileId } from '../core/profileStore.js';
import { recordQuizAttempt } from '../core/progressStore.js';
import { parseFactorSpec, generateProblem, GENERATOR_ID } from '../skills/multiplicationTables.js';

const ANSWER_PAUSE_MS = 800;

const els = {};
let state = null;

function cacheElements() {
  els.setupSection = document.getElementById('skill-setup');
  els.activeSection = document.getElementById('skill-active');
  els.resultsSection = document.getElementById('skill-results');
  els.factorAInput = document.getElementById('factor-a-input');
  els.factorBInput = document.getElementById('factor-b-input');
  els.countSelect = document.getElementById('skill-count-select');
  els.setupError = document.getElementById('skill-setup-error');
  els.startBtn = document.getElementById('skill-start-btn');
  els.progressText = document.getElementById('skill-progress-text');
  els.equation = document.getElementById('skill-equation');
  els.choices = document.getElementById('skill-choices');
  els.feedback = document.getElementById('skill-feedback');
  els.scoreSummary = document.getElementById('skill-score-summary');
  els.retryBtn = document.getElementById('skill-retry-btn');
  els.backBtn = document.getElementById('skill-back-btn');
}

function startPractice() {
  const factorsA = parseFactorSpec(els.factorAInput.value);
  const factorsB = parseFactorSpec(els.factorBInput.value);

  if (!factorsA || !factorsB) {
    els.setupError.textContent = 'Enter a valid factor or range for both boxes, e.g. "2" or "1-12" or "2,5-7" (0-20 only).';
    els.setupError.hidden = false;
    return;
  }
  els.setupError.hidden = true;

  const count = Number(els.countSelect.value);
  const baseSeed = randomSeed();
  const problems = [];
  for (let i = 0; i < count; i++) {
    const seed = baseSeed + i;
    const rng = createRng(seed);
    problems.push({ ...generateProblem(rng, factorsA, factorsB), seed });
  }

  state = {
    factorsLabel: `${els.factorAInput.value.trim()} × ${els.factorBInput.value.trim()}`,
    problems,
    currentIndex: 0,
    results: [],
    startedAt: new Date().toISOString(),
    questionStartedAt: 0,
    locked: false,
  };

  els.setupSection.hidden = true;
  els.resultsSection.hidden = true;
  els.activeSection.hidden = false;
  renderQuestion();
}

function renderQuestion() {
  const problem = state.problems[state.currentIndex];
  els.progressText.textContent = `Question ${state.currentIndex + 1} of ${state.problems.length}`;
  els.equation.textContent = `${problem.promptText} = ?`;
  els.feedback.hidden = true;
  els.feedback.className = 'feedback';
  state.locked = false;

  els.choices.innerHTML = '';
  problem.choices.forEach((choice, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice-btn';
    btn.dataset.index = String(index);
    const key = document.createElement('span');
    key.className = 'choice-key';
    key.textContent = String(index + 1);
    const value = document.createElement('span');
    value.className = 'choice-value';
    value.textContent = choice;
    btn.append(key, value);
    els.choices.appendChild(btn);
  });

  state.questionStartedAt = Date.now();
}

function selectAnswer(index) {
  if (!state || state.locked || els.activeSection.hidden) return;
  const problem = state.problems[state.currentIndex];
  if (index < 0 || index >= problem.choices.length) return;

  state.locked = true;
  const chosen = problem.choices[index];
  const isCorrect = chosen === problem.answerDisplay;
  const timeMs = Date.now() - state.questionStartedAt;

  state.results.push({ generatorId: GENERATOR_ID, difficulty: null, seed: problem.seed, correct: isCorrect, userAnswer: chosen, timeMs });

  const buttons = Array.from(els.choices.querySelectorAll('.choice-btn'));
  for (const btn of buttons) {
    btn.disabled = true;
    if (btn.dataset.index === String(index)) {
      btn.classList.add(isCorrect ? 'correct' : 'incorrect');
    } else if (!isCorrect && problem.choices[Number(btn.dataset.index)] === problem.answerDisplay) {
      btn.classList.add('reveal-correct');
    }
  }

  els.feedback.hidden = false;
  els.feedback.classList.add(isCorrect ? 'correct' : 'incorrect');
  els.feedback.textContent = isCorrect ? 'Correct!' : `Not quite — ${problem.promptText} = ${problem.answerDisplay}`;

  setTimeout(advance, ANSWER_PAUSE_MS);
}

function advance() {
  state.currentIndex += 1;
  if (state.currentIndex < state.problems.length) {
    renderQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  els.activeSection.hidden = true;
  els.resultsSection.hidden = false;

  recordQuizAttempt(getActiveProfileId(), {
    type: 'skill',
    grade: null,
    topics: ['multiplicationTables'],
    difficulty: state.factorsLabel,
    startedAt: state.startedAt,
    completedAt: new Date().toISOString(),
    problems: state.results,
  });

  const total = state.results.length;
  const correct = state.results.filter((r) => r.correct).length;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
  els.scoreSummary.textContent = `You got ${correct} out of ${total} correct (${percent}%).`;
}

function backToSetup() {
  state = null;
  els.resultsSection.hidden = true;
  els.activeSection.hidden = true;
  els.setupSection.hidden = false;
}

function handleChoiceClick(event) {
  const btn = event.target.closest('.choice-btn');
  if (!btn) return;
  selectAnswer(Number(btn.dataset.index));
}

const KEY_TO_INDEX = { 1: 0, 2: 1, 3: 2, 4: 3 };

function handleKeydown(event) {
  if (els.activeSection.hidden) return;
  const index = KEY_TO_INDEX[event.key];
  if (index === undefined) return;
  event.preventDefault();
  selectAnswer(index);
}

export function init() {
  cacheElements();
  renderNav('skills.html');

  els.startBtn.addEventListener('click', startPractice);
  els.choices.addEventListener('click', handleChoiceClick);
  document.addEventListener('keydown', handleKeydown);
  els.retryBtn.addEventListener('click', startPractice);
  els.backBtn.addEventListener('click', backToSetup);
}
