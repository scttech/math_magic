import '../app/init.js';
import { renderNav } from '../app/nav.js';
import { topicLabel } from '../app/topicLabels.js';
import { populateGradeSelect, populateTopicCheckboxes, getSelectedTopics, syncSelectAllCheckbox, wireSelectAllToggle } from '../app/topicPicker.js';
import { buildProblemSet } from '../core/problemSet.js';
import { randomSeed } from '../core/rng.js';
import { getActiveProfileId } from '../core/profileStore.js';
import { recordQuizAttempt } from '../core/progressStore.js';
import { hasHelp, buildHelpUrl } from '../core/helpRegistry.js';
import { renderCoordinatePlane } from '../charts/coordinatePlane.js';

const els = {};
let state = null;

// Bigger than the renderer's own default (280px) since the quiz page has more
// room to spare than a printed worksheet column does.
const QUIZ_GRID_SIZE = 340;

function cacheElements() {
  els.setupSection = document.getElementById('quiz-setup');
  els.activeSection = document.getElementById('quiz-active');
  els.resultsSection = document.getElementById('quiz-results');
  els.gradeSelect = document.getElementById('grade-select');
  els.selectAllTopics = document.getElementById('select-all-topics');
  els.topicList = document.getElementById('topic-checkboxes');
  els.difficultySelect = document.getElementById('difficulty-select');
  els.countSelect = document.getElementById('count-select');
  els.startBtn = document.getElementById('start-quiz-btn');
  els.progressText = document.getElementById('progress-text');
  els.promptText = document.getElementById('prompt-text');
  els.helpLink = document.getElementById('help-link');
  els.gridContainer = document.getElementById('quiz-grid-container');
  els.answerFieldRow = document.getElementById('answer-field-row');
  els.answerInput = document.getElementById('answer-input');
  els.submitBtn = document.getElementById('submit-answer-btn');
  els.nextBtn = document.getElementById('next-question-btn');
  els.feedback = document.getElementById('feedback');
  els.scoreSummary = document.getElementById('score-summary');
  els.topicBreakdown = document.getElementById('topic-breakdown');
  els.retryBtn = document.getElementById('retry-btn');
  els.backToSetupBtn = document.getElementById('back-to-setup-btn');
  els.quizForm = document.getElementById('quiz-answer-form');
}

function populateTopics() {
  populateTopicCheckboxes(els.topicList, els.gradeSelect.value);
  syncSelectAllCheckbox(els.selectAllTopics, els.topicList);
  updateStartEnabled();
}

function updateStartEnabled() {
  els.startBtn.disabled = getSelectedTopics(els.topicList).length === 0;
}

function startQuiz() {
  const grade = els.gradeSelect.value;
  const topics = getSelectedTopics(els.topicList);
  const difficulty = els.difficultySelect.value;
  const count = Number(els.countSelect.value);

  state = {
    grade,
    topics,
    difficulty,
    problems: buildProblemSet({ grade, topics, difficulty, count, seed: randomSeed() }),
    currentIndex: 0,
    results: [],
    startedAt: new Date().toISOString(),
    questionStartedAt: 0,
  };

  els.setupSection.hidden = true;
  els.resultsSection.hidden = true;
  els.activeSection.hidden = false;
  renderQuestion();
}

function renderInteractiveGrid() {
  const problem = state.problems[state.currentIndex];
  renderCoordinatePlane(els.gridContainer, {
    size: QUIZ_GRID_SIZE,
    ...problem.visual,
    interactive: true,
    marker: state.placedMarker,
    onPlace: (x, y) => {
      state.placedMarker = { x, y };
      els.submitBtn.disabled = false;
      renderInteractiveGrid();
    },
  });
}

function renderQuestion() {
  const problem = state.problems[state.currentIndex];
  els.progressText.textContent = `Question ${state.currentIndex + 1} of ${state.problems.length}`;
  els.promptText.textContent = problem.promptText;
  if (hasHelp(problem.meta.generatorId)) {
    els.helpLink.href = buildHelpUrl(problem);
    els.helpLink.hidden = false;
  } else {
    els.helpLink.hidden = true;
  }

  state.placedMarker = null;
  if (problem.visual) {
    els.gridContainer.hidden = false;
    if (problem.visual.interactive) {
      els.answerFieldRow.hidden = true;
      els.submitBtn.disabled = true;
      renderInteractiveGrid();
    } else {
      els.answerFieldRow.hidden = false;
      els.submitBtn.disabled = false;
      renderCoordinatePlane(els.gridContainer, { size: QUIZ_GRID_SIZE, ...problem.visual });
    }
  } else {
    els.gridContainer.hidden = true;
    els.answerFieldRow.hidden = false;
    els.submitBtn.disabled = false;
  }

  els.answerInput.value = '';
  els.answerInput.disabled = false;
  els.submitBtn.hidden = false;
  els.nextBtn.hidden = true;
  els.feedback.hidden = true;
  els.feedback.className = 'feedback';
  if (!problem.visual || !problem.visual.interactive) els.answerInput.focus();
  state.questionStartedAt = Date.now();
}

function submitAnswer() {
  const problem = state.problems[state.currentIndex];
  const userInput =
    problem.visual && problem.visual.interactive
      ? state.placedMarker
        ? `(${state.placedMarker.x}, ${state.placedMarker.y})`
        : ''
      : els.answerInput.value.trim();
  const isCorrect = userInput.length > 0 && problem.checkAnswer(userInput);
  const timeMs = Date.now() - state.questionStartedAt;

  state.results.push({
    topic: problem.topic,
    generatorId: problem.meta.generatorId,
    difficulty: problem.meta.difficulty,
    seed: problem.seed,
    correct: isCorrect,
    userAnswer: userInput,
    timeMs,
  });

  els.feedback.hidden = false;
  els.feedback.classList.add(isCorrect ? 'correct' : 'incorrect');
  els.feedback.textContent = isCorrect ? 'Correct! Great job.' : `Not quite. The correct answer was: ${problem.answerDisplay}`;

  if (problem.visual && problem.visual.interactive) {
    // Freeze the grid and, if wrong, show the correct point alongside the student's own marker.
    renderCoordinatePlane(els.gridContainer, {
      size: QUIZ_GRID_SIZE,
      ...problem.visual,
      interactive: false,
      marker: state.placedMarker,
      points: isCorrect ? [] : [{ x: problem.meta.x, y: problem.meta.y, label: 'Correct' }],
    });
  }

  els.answerInput.disabled = true;
  els.submitBtn.hidden = true;
  els.nextBtn.hidden = false;
  els.nextBtn.textContent = state.currentIndex + 1 < state.problems.length ? 'Next Question' : 'See Results';
  els.nextBtn.focus();
}

function nextQuestion() {
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
    grade: state.grade,
    topics: state.topics,
    difficulty: state.difficulty,
    startedAt: state.startedAt,
    completedAt: new Date().toISOString(),
    problems: state.results.map(({ generatorId, difficulty, seed, correct, userAnswer, timeMs }) => ({
      generatorId,
      difficulty,
      seed,
      correct,
      userAnswer,
      timeMs,
    })),
  });

  const total = state.results.length;
  const correct = state.results.filter((r) => r.correct).length;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
  els.scoreSummary.textContent = `You got ${correct} out of ${total} correct (${percent}%).`;

  const byTopic = new Map();
  for (const result of state.results) {
    const entry = byTopic.get(result.topic) || { correct: 0, total: 0 };
    entry.total += 1;
    if (result.correct) entry.correct += 1;
    byTopic.set(result.topic, entry);
  }

  const rows = Array.from(byTopic.entries())
    .map(([topic, { correct: c, total: t }]) => `<tr><td>${topicLabel(topic)}</td><td>${c} / ${t}</td></tr>`)
    .join('');
  els.topicBreakdown.innerHTML = `
    <table class="results-table">
      <thead><tr><th>Topic</th><th>Score</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function backToSetup() {
  state = null;
  els.resultsSection.hidden = true;
  els.activeSection.hidden = true;
  els.setupSection.hidden = false;
}

export function init() {
  cacheElements();
  renderNav('quiz.html');
  populateGradeSelect(els.gradeSelect);
  populateTopics();

  wireSelectAllToggle(els.selectAllTopics, els.topicList);
  els.gradeSelect.addEventListener('change', populateTopics);
  els.topicList.addEventListener('change', updateStartEnabled);
  els.startBtn.addEventListener('click', startQuiz);
  els.quizForm.addEventListener('submit', (event) => {
    event.preventDefault();
    submitAnswer();
  });
  els.nextBtn.addEventListener('click', nextQuestion);
  els.retryBtn.addEventListener('click', startQuiz);
  els.backToSetupBtn.addEventListener('click', backToSetup);
}
