// Review Mistakes: drills just the problems a student has gotten wrong
// before. A reviewable mistake comes in one of two shapes (js/core/
// mistakeReview.js decides which): a registry generatorId + difficulty +
// seed, regenerated into the exact original problem (full fidelity —
// free-text/visual input, real checkAnswer(), a help link) the same way the
// Quiz view and Worksheet answer-key lookup already do; or a grade-agnostic
// skill/game's own stored promptText/answerDisplay/choices snapshot, shown as
// a multiple-choice question the same way the skill drills already do.
import '../app/init.js';
import { renderNav } from '../app/nav.js';
import { createRng } from '../core/rng.js';
import { getById } from '../core/registry.js';
import { getActiveProfileId } from '../core/profileStore.js';
import { getProgress, recordQuizAttempt } from '../core/progressStore.js';
import { collectMistakes, groupMistakesByTopic, markMistakeResolved } from '../core/mistakeReview.js';
import { hasHelp, buildHelpUrl } from '../core/helpRegistry.js';
import { renderVisual } from '../charts/renderVisual.js';
import { linkifyGlossaryTerms } from '../app/glossary.js';
import { renderShape } from '../skills/shapeRenderer.js';
import { topicLabel } from '../app/topicLabels.js';
import { playCorrectSound, playIncorrectSound, animateFeedback } from '../app/feedbackFx.js';
import { pickCelebrationForAccuracy, showCelebration } from '../app/celebrations.js';

const ANSWER_PAUSE_MS = 900;
const GRID_SIZE = 320;
const KEY_TO_INDEX = { 1: 0, 2: 1, 3: 2, 4: 3 };

const els = {};
let state = null;

function cacheElements() {
  els.setupSection = document.getElementById('review-setup');
  els.activeSection = document.getElementById('review-active');
  els.resultsSection = document.getElementById('review-results');
  els.emptyState = document.getElementById('review-empty');
  els.summary = document.getElementById('review-summary');
  els.countText = document.getElementById('review-count-text');
  els.topicChips = document.getElementById('review-topic-chips');
  els.startBtn = document.getElementById('review-start-btn');

  els.progressText = document.getElementById('review-progress-text');
  els.helpLink = document.getElementById('review-help-link');
  els.promptText = document.getElementById('review-prompt-text');
  els.shapeDisplay = document.getElementById('review-shape-display');
  els.gridContainer = document.getElementById('review-grid-container');
  els.answerForm = document.getElementById('review-answer-form');
  els.answerFieldRow = document.getElementById('review-answer-field-row');
  els.answerInput = document.getElementById('review-answer-input');
  els.submitBtn = document.getElementById('review-submit-btn');
  els.nextBtn = document.getElementById('review-next-btn');
  els.choices = document.getElementById('review-choices');
  els.feedback = document.getElementById('review-feedback');

  els.celebrationImage = document.getElementById('review-celebration-image');
  els.scoreSummary = document.getElementById('review-score-summary');
  els.againBtn = document.getElementById('review-again-btn');
}

function loadSetup() {
  const progress = getProgress(getActiveProfileId());
  const mistakes = collectMistakes(progress);

  els.emptyState.hidden = mistakes.length > 0;
  els.summary.hidden = mistakes.length === 0;
  els.startBtn.hidden = mistakes.length === 0;

  if (mistakes.length > 0) {
    els.countText.textContent = `${mistakes.length} problem${mistakes.length === 1 ? '' : 's'} to review.`;
    els.topicChips.innerHTML = groupMistakesByTopic(mistakes)
      .map(({ topic, count }) => `<span class="badge-chip">${topicLabel(topic)}: ${count}</span>`)
      .join('');
  }

  return mistakes;
}

/** Regenerates a registry-based mistake into its exact original problem, or falls back to the stored display snapshot. */
function buildActiveProblem(mistake) {
  const mod = getById(mistake.generatorId);
  if (mod) {
    const problem = { ...mod.generate({ difficulty: mistake.difficulty, rng: createRng(mistake.seed) }), seed: mistake.seed };
    return { mode: 'registry', problem };
  }
  return { mode: 'snapshot', problem: mistake };
}

function startReview() {
  const mistakes = loadSetup();
  els.setupSection.hidden = false;
  if (mistakes.length === 0) {
    els.activeSection.hidden = true;
    els.resultsSection.hidden = true;
    return;
  }

  state = {
    mistakes,
    currentIndex: 0,
    results: [],
    startedAt: new Date().toISOString(),
    questionStartedAt: 0,
    placedMarker: null,
    locked: false,
    current: null,
  };

  els.setupSection.hidden = true;
  els.resultsSection.hidden = true;
  els.activeSection.hidden = false;
  renderQuestion();
}

function renderRegistryGrid(interactive) {
  const { problem } = state.current;
  renderVisual(els.gridContainer, {
    size: GRID_SIZE,
    ...problem.visual,
    interactive,
    marker: state.placedMarker,
    onPlace: interactive
      ? (x, y) => {
          state.placedMarker = { x, y };
          els.submitBtn.disabled = false;
          renderRegistryGrid(true);
        }
      : null,
  });
}

function renderRegistryQuestion(problem) {
  els.choices.hidden = true;
  els.shapeDisplay.hidden = true;
  els.answerForm.hidden = false;
  els.promptText.innerHTML = linkifyGlossaryTerms(problem.promptText);

  if (hasHelp(problem.meta.generatorId)) {
    els.helpLink.href = buildHelpUrl(problem);
    els.helpLink.hidden = false;
  } else {
    els.helpLink.hidden = true;
  }

  if (problem.visual) {
    els.gridContainer.hidden = false;
    if (problem.visual.interactive) {
      els.answerFieldRow.hidden = true;
      els.submitBtn.disabled = true;
      renderRegistryGrid(true);
    } else {
      els.answerFieldRow.hidden = false;
      els.submitBtn.disabled = false;
      renderRegistryGrid(false);
    }
  } else {
    els.gridContainer.hidden = true;
    els.answerFieldRow.hidden = false;
    els.submitBtn.disabled = false;
  }

  els.answerInput.value = '';
  els.answerInput.disabled = false;
  if (!problem.visual || !problem.visual.interactive) els.answerInput.focus();
}

function renderSnapshotQuestion(problem) {
  els.answerForm.hidden = true;
  els.gridContainer.hidden = true;
  els.helpLink.hidden = true;

  if (problem.shapeId) {
    els.promptText.textContent = 'What shape is this?';
    els.shapeDisplay.hidden = false;
    renderShape(els.shapeDisplay, problem.shapeId, 180);
  } else {
    els.promptText.textContent = problem.promptText;
    els.shapeDisplay.hidden = true;
  }

  els.choices.hidden = false;
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
}

function renderQuestion() {
  const mistake = state.mistakes[state.currentIndex];
  state.current = buildActiveProblem(mistake);
  state.placedMarker = null;
  state.locked = false;

  els.progressText.textContent = `Review ${state.currentIndex + 1} of ${state.mistakes.length}`;
  els.feedback.hidden = true;
  els.feedback.className = 'feedback';
  els.submitBtn.hidden = false;
  els.nextBtn.hidden = true;

  if (state.current.mode === 'registry') renderRegistryQuestion(state.current.problem);
  else renderSnapshotQuestion(state.current.problem);

  state.questionStartedAt = Date.now();
}

function recordResult(isCorrect, userAnswer) {
  const mistake = state.mistakes[state.currentIndex];
  const timeMs = Date.now() - state.questionStartedAt;
  state.results.push({ generatorId: mistake.generatorId, difficulty: mistake.difficulty, seed: mistake.seed, correct: isCorrect, userAnswer, timeMs });
  if (isCorrect) {
    markMistakeResolved(getActiveProfileId(), mistake.key);
    playCorrectSound();
  } else {
    playIncorrectSound();
  }
}

function submitRegistryAnswer(event) {
  event.preventDefault();
  if (!state || state.current.mode !== 'registry') return;
  const { problem } = state.current;
  const userInput =
    problem.visual && problem.visual.interactive
      ? state.placedMarker
        ? `(${state.placedMarker.x}, ${state.placedMarker.y})`
        : ''
      : els.answerInput.value.trim();
  const isCorrect = userInput.length > 0 && problem.checkAnswer(userInput);

  recordResult(isCorrect, userInput);

  els.feedback.hidden = false;
  els.feedback.classList.add(isCorrect ? 'correct' : 'incorrect');
  els.feedback.textContent = isCorrect ? 'Correct! Great job.' : `Not quite. The correct answer was: ${problem.answerDisplay}`;
  animateFeedback(els.feedback, isCorrect);

  if (problem.visual && problem.visual.interactive) {
    renderVisual(els.gridContainer, {
      size: GRID_SIZE,
      ...problem.visual,
      interactive: false,
      marker: state.placedMarker,
      points: isCorrect ? [] : [{ x: problem.meta.x, y: problem.meta.y, label: 'Correct' }],
    });
  }

  els.answerInput.disabled = true;
  els.submitBtn.hidden = true;
  els.nextBtn.hidden = false;
  els.nextBtn.textContent = state.currentIndex + 1 < state.mistakes.length ? 'Next Question' : 'See Results';
  els.nextBtn.focus();
}

function selectSnapshotAnswer(index) {
  if (!state || state.locked || state.current.mode !== 'snapshot') return;
  const { problem } = state.current;
  if (index < 0 || index >= problem.choices.length) return;
  state.locked = true;

  const chosen = problem.choices[index];
  const isCorrect = chosen === problem.answerDisplay;
  recordResult(isCorrect, chosen);

  const buttons = Array.from(els.choices.querySelectorAll('.choice-btn'));
  let chosenBtn = null;
  for (const btn of buttons) {
    btn.disabled = true;
    if (btn.dataset.index === String(index)) {
      chosenBtn = btn;
      btn.classList.add(isCorrect ? 'correct' : 'incorrect');
    } else if (!isCorrect && problem.choices[Number(btn.dataset.index)] === problem.answerDisplay) {
      btn.classList.add('reveal-correct');
    }
  }

  els.feedback.hidden = false;
  els.feedback.classList.add(isCorrect ? 'correct' : 'incorrect');
  els.feedback.textContent = isCorrect ? 'Correct!' : `Not quite. The correct answer was: ${problem.answerDisplay}`;
  animateFeedback(chosenBtn, isCorrect);

  setTimeout(advance, ANSWER_PAUSE_MS);
}

function advance() {
  if (!state || !els.resultsSection.hidden) return;
  state.currentIndex += 1;
  if (state.currentIndex < state.mistakes.length) renderQuestion();
  else showResults();
}

function showResults() {
  els.activeSection.hidden = true;
  els.resultsSection.hidden = false;

  const topics = Array.from(new Set(state.mistakes.flatMap((m) => m.topics)));
  recordQuizAttempt(getActiveProfileId(), {
    type: 'review',
    grade: null,
    topics,
    difficulty: null,
    startedAt: state.startedAt,
    completedAt: new Date().toISOString(),
    problems: state.results,
  });

  const total = state.results.length;
  const correct = state.results.filter((r) => r.correct).length;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
  els.scoreSummary.textContent = `You got ${correct} out of ${total} correct (${percent}%).`;
  showCelebration(els.celebrationImage, pickCelebrationForAccuracy(total === 0 ? 0 : correct / total));
}

function handleChoiceClick(event) {
  const btn = event.target.closest('.choice-btn');
  if (!btn) return;
  selectSnapshotAnswer(Number(btn.dataset.index));
}

function handleKeydown(event) {
  if (!state || els.activeSection.hidden || state.current.mode !== 'snapshot') return;
  const index = KEY_TO_INDEX[event.key];
  if (index === undefined) return;
  event.preventDefault();
  selectSnapshotAnswer(index);
}

export function init() {
  cacheElements();
  renderNav('dashboard.html');
  loadSetup();

  els.startBtn.addEventListener('click', startReview);
  els.againBtn.addEventListener('click', startReview);
  els.answerForm.addEventListener('submit', submitRegistryAnswer);
  els.nextBtn.addEventListener('click', advance);
  els.choices.addEventListener('click', handleChoiceClick);
  document.addEventListener('keydown', handleKeydown);
}
