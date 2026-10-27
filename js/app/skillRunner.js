// Shared wiring for the "setup -> multiple-choice questions -> results" flow
// every grade-agnostic skill drill uses. multiplicationTables and
// shapeIdentification each hand-rolled this flow; this factors it out for the
// fact-fluency drills (addition/subtraction/division) so adding one doesn't
// mean copying ~150 lines of event wiring again. Only setup validation,
// problem generation, and how a question is displayed differ between skills.
import { renderNav } from './nav.js';
import { createRng, randomSeed } from '../core/rng.js';
import { getActiveProfileId } from '../core/profileStore.js';
import { recordQuizAttempt } from '../core/progressStore.js';
import { playCorrectSound, playIncorrectSound, animateFeedback } from './feedbackFx.js';

const KEY_TO_INDEX = { 1: 0, 2: 1, 3: 2, 4: 3 };

const BLITZ_SECONDS = 60;
// A large pre-generated pool rather than true lazy generation — simpler, and
// 300 questions is far more than anyone answers in 60 seconds, so it never
// runs out before the clock does.
const BLITZ_PROBLEM_BUFFER = 300;

/**
 * @param {Object} config
 * @param {Object<string,string>} config.elementIds - DOM id for every element the flow touches, both the
 *   generic ones (setupSection, activeSection, resultsSection, countSelect, setupError, startBtn,
 *   progressText, promptContainer, choices, feedback, scoreSummary, retryBtn, backBtn) and any
 *   skill-specific setup inputs a skill's own validateSetup() needs to read. Two more are optional and
 *   enable Blitz Mode: blitzToggle (a setup checkbox) and timerText (shown/updated during a blitz run).
 * @param {string} config.navPage - page passed to renderNav().
 * @param {string} config.generatorId - recorded on each attempt for the dashboard.
 * @param {string[]} config.topics - recorded on each attempt for the dashboard.
 * @param {(els: Object) => ({error: string}|{label: string, args: any[]})} config.validateSetup
 * @param {(rng: Function, ...args: any[]) => Object} config.generateProblem - same contract as a skill module's generateProblem.
 * @param {(container: Element, problem: Object) => void} config.renderPrompt
 * @param {(problem: Object) => string} config.notCorrectText - feedback shown on a wrong answer.
 * @param {number} [config.answerPauseMs]
 */
export function initSkillRunner(config) {
  const { elementIds, navPage, generatorId, topics, validateSetup, generateProblem, renderPrompt, notCorrectText, answerPauseMs = 800 } = config;

  const els = {};
  let state = null;
  let blitzIntervalId = null;

  function cacheElements() {
    for (const [key, id] of Object.entries(elementIds)) {
      els[key] = document.getElementById(id);
    }
  }

  function clearBlitzTimer() {
    if (blitzIntervalId !== null) {
      clearInterval(blitzIntervalId);
      blitzIntervalId = null;
    }
  }

  function updateTimerText() {
    if (els.timerText) els.timerText.textContent = `⏱ ${state.timeRemaining}s left`;
  }

  function startBlitzTimer() {
    updateTimerText();
    blitzIntervalId = setInterval(() => {
      state.timeRemaining -= 1;
      updateTimerText();
      if (state.timeRemaining <= 0) showResults();
    }, 1000);
  }

  function startPractice() {
    const setup = validateSetup(els);
    if (setup.error) {
      els.setupError.textContent = setup.error;
      els.setupError.hidden = false;
      return;
    }
    els.setupError.hidden = true;

    const isBlitz = Boolean(els.blitzToggle && els.blitzToggle.checked);
    const count = isBlitz ? BLITZ_PROBLEM_BUFFER : Number(els.countSelect.value);
    const baseSeed = randomSeed();
    const problems = [];
    for (let i = 0; i < count; i++) {
      const seed = baseSeed + i;
      const rng = createRng(seed);
      problems.push({ ...generateProblem(rng, ...setup.args), seed });
    }

    clearBlitzTimer();
    state = {
      label: setup.label,
      problems,
      currentIndex: 0,
      results: [],
      startedAt: new Date().toISOString(),
      questionStartedAt: 0,
      locked: false,
      timeRemaining: isBlitz ? BLITZ_SECONDS : null,
    };

    if (els.timerText) els.timerText.hidden = !isBlitz;

    els.setupSection.hidden = true;
    els.resultsSection.hidden = true;
    els.activeSection.hidden = false;
    if (isBlitz) startBlitzTimer();
    renderQuestion();
  }

  function renderQuestion() {
    const problem = state.problems[state.currentIndex];
    els.progressText.textContent = `Question ${state.currentIndex + 1} of ${state.problems.length}`;
    renderPrompt(els.promptContainer, problem);
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

    state.results.push({ generatorId, difficulty: null, seed: problem.seed, correct: isCorrect, userAnswer: chosen, timeMs });

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
    els.feedback.textContent = isCorrect ? 'Correct!' : notCorrectText(problem);

    if (isCorrect) playCorrectSound();
    else playIncorrectSound();
    animateFeedback(chosenBtn, isCorrect);
    animateFeedback(els.feedback, isCorrect);

    setTimeout(advance, answerPauseMs);
  }

  function advance() {
    // In Blitz Mode, the timer can end the run (via showResults) while an
    // answer-pause setTimeout from the just-answered question is still
    // pending — when that stray call lands, results are already showing, so
    // just ignore it rather than resurrecting a new question behind the scenes.
    if (!state || !els.resultsSection.hidden) return;
    state.currentIndex += 1;
    if (state.currentIndex < state.problems.length) {
      renderQuestion();
    } else {
      showResults();
    }
  }

  function showResults() {
    clearBlitzTimer();
    els.activeSection.hidden = true;
    els.resultsSection.hidden = false;

    recordQuizAttempt(getActiveProfileId(), {
      type: 'skill',
      grade: null,
      topics,
      difficulty: state.label,
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
    clearBlitzTimer();
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

  function handleKeydown(event) {
    if (els.activeSection.hidden) return;
    const index = KEY_TO_INDEX[event.key];
    if (index === undefined) return;
    event.preventDefault();
    selectAnswer(index);
  }

  cacheElements();
  renderNav(navPage);

  els.startBtn.addEventListener('click', startPractice);
  els.choices.addEventListener('click', handleChoiceClick);
  document.addEventListener('keydown', handleKeydown);
  els.retryBtn.addEventListener('click', startPractice);
  els.backBtn.addEventListener('click', backToSetup);
  if (els.blitzToggle && els.countSelect) {
    els.blitzToggle.addEventListener('change', () => {
      els.countSelect.disabled = els.blitzToggle.checked;
    });
  }
}
