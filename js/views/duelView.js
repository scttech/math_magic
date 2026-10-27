// Local 2-player "Duel" mode: both players race on the same shared problem,
// each with their own independent multiple-choice grid. First correct click
// scores the round; a wrong click only locks that player out of the round,
// not the match. Players are two distinct profiles (not free-text names), so
// the match's outcome and each player's own answers can be recorded to their
// own progress history — same recordQuizAttempt() every other game uses —
// which is what lets computeDuelStats()/computeBadges() track win/loss
// records and duel-specific badges per profile.
import '../app/init.js';
import { renderNav } from '../app/nav.js';
import { createRng, randomSeed } from '../core/rng.js';
import { playCorrectSound, playIncorrectSound, animateFeedback } from '../app/feedbackFx.js';
import { pickGoodCelebration, showCelebration } from '../app/celebrations.js';
import { determineWinner } from '../app/duelScoring.js';
import { listProfiles, getProfile } from '../core/profileStore.js';
import { getProgress, recordQuizAttempt } from '../core/progressStore.js';
import { computeDuelStats } from '../core/scoring.js';
import { parseNumberSpec } from '../skills/numberSpec.js';
import { generateProblem as generateAddition, GENERATOR_ID as ADD_ID, MIN_VALUE as ADD_MIN, MAX_VALUE as ADD_MAX } from '../skills/additionFacts.js';
import { generateProblem as generateSubtraction, GENERATOR_ID as SUB_ID, MIN_VALUE as SUB_MIN, MAX_VALUE as SUB_MAX } from '../skills/subtractionFacts.js';
import { generateProblem as generateDivision, GENERATOR_ID as DIV_ID, MIN_DIVISOR, MAX_DIVISOR, MIN_QUOTIENT, MAX_QUOTIENT } from '../skills/divisionFacts.js';
import { generateProblem as generateMultiplication, GENERATOR_ID as MULT_ID, parseFactorSpec } from '../skills/multiplicationTables.js';
import { generateProblem as generateFractionSimplification, GENERATOR_ID as FRAC_ID, isReducible, MIN_DENOMINATOR as FRAC_MIN, MAX_DENOMINATOR as FRAC_MAX } from '../skills/fractionSimplification.js';
import { generateProblem as generateMixedNumbers, GENERATOR_ID as MIXED_ID, MIN_DENOMINATOR as MIXED_MIN, MAX_DENOMINATOR as MIXED_MAX } from '../skills/mixedNumbers.js';

const ROUND_PAUSE_MS = 1400;

// Keyboard support for a shared keyboard: each player needs keys that can't
// collide with the other player's, and a single keyboard shortcut isn't
// reliably available on every machine (not everyone has a number pad), so
// each player gets a primary set plus, for Player 2, a numpad alternate.
// event.code (the physical key) is used rather than event.key, so this
// distinguishes the top-row "1" from Numpad "1" even though both report the
// same .key value.
const PLAYER_A_CODES = ['Digit1', 'Digit2', 'Digit3', 'Digit4'];
const PLAYER_A_KEY_LABELS = ['1', '2', '3', '4'];
const PLAYER_B_CODES = ['KeyA', 'KeyS', 'KeyD', 'KeyF'];
const PLAYER_B_NUMPAD_CODES = ['Numpad1', 'Numpad2', 'Numpad3', 'Numpad4'];
const PLAYER_B_KEY_LABELS = ['A', 'S', 'D', 'F'];

// Fixed default ranges per topic — Duel Mode is "pick a topic and go", not a
// practice-drill configuration screen, so there's no per-session number-spec
// input like the solo skill drills have.
const TOPICS = [
  {
    key: 'multiplicationTables',
    label: 'Multiplication Tables (1–12)',
    generatorId: MULT_ID,
    args: [parseFactorSpec('1-12'), parseFactorSpec('1-12')],
    generate: generateMultiplication,
    renderPrompt: (p) => `${p.promptText} = ?`,
  },
  {
    key: 'additionFacts',
    label: 'Addition Facts (0–12)',
    generatorId: ADD_ID,
    args: [parseNumberSpec('0-12', ADD_MIN, ADD_MAX), parseNumberSpec('0-12', ADD_MIN, ADD_MAX)],
    generate: generateAddition,
    renderPrompt: (p) => `${p.promptText} = ?`,
  },
  {
    key: 'subtractionFacts',
    label: 'Subtraction Facts (0–12)',
    generatorId: SUB_ID,
    args: [parseNumberSpec('0-12', SUB_MIN, SUB_MAX), parseNumberSpec('0-12', SUB_MIN, SUB_MAX)],
    generate: generateSubtraction,
    renderPrompt: (p) => `${p.promptText} = ?`,
  },
  {
    key: 'divisionFacts',
    label: 'Division Facts (1–12)',
    generatorId: DIV_ID,
    args: [parseNumberSpec('1-12', MIN_DIVISOR, MAX_DIVISOR), parseNumberSpec('1-12', MIN_QUOTIENT, MAX_QUOTIENT)],
    generate: generateDivision,
    renderPrompt: (p) => `${p.promptText} = ?`,
  },
  {
    key: 'fractionSimplification',
    label: 'Fraction Simplification (4–24)',
    generatorId: FRAC_ID,
    args: [parseNumberSpec('4-24', FRAC_MIN, FRAC_MAX).filter(isReducible)],
    generate: generateFractionSimplification,
    renderPrompt: (p) => `${p.promptText} = ?`,
  },
  {
    key: 'mixedNumbers',
    label: 'Mixed Numbers & Improper Fractions (2–12)',
    generatorId: MIXED_ID,
    args: [parseNumberSpec('2-12', MIXED_MIN, MIXED_MAX)],
    generate: generateMixedNumbers,
    renderPrompt: (p) => p.promptText,
  },
];

const els = {};
let state = null;

function cacheElements() {
  els.setupSection = document.getElementById('duel-setup');
  els.activeSection = document.getElementById('duel-active');
  els.resultsSection = document.getElementById('duel-results');
  els.topicSelect = document.getElementById('duel-topic-select');
  els.playerASelect = document.getElementById('duel-player-a-select');
  els.playerBSelect = document.getElementById('duel-player-b-select');
  els.playerARecord = document.getElementById('duel-player-a-record');
  els.playerBRecord = document.getElementById('duel-player-b-record');
  els.roundsSelect = document.getElementById('duel-rounds-select');
  els.setupError = document.getElementById('duel-setup-error');
  els.startBtn = document.getElementById('duel-start-btn');
  els.roundText = document.getElementById('duel-round-text');
  els.prompt = document.getElementById('duel-prompt');
  els.roundBanner = document.getElementById('duel-round-banner');
  els.playerAName = document.getElementById('duel-player-a-name');
  els.playerBName = document.getElementById('duel-player-b-name');
  els.scoreA = document.getElementById('duel-score-a');
  els.scoreB = document.getElementById('duel-score-b');
  els.choicesA = document.getElementById('duel-choices-a');
  els.choicesB = document.getElementById('duel-choices-b');
  els.winnerBanner = document.getElementById('duel-winner-banner');
  els.celebrationImage = document.getElementById('duel-celebration-image');
  els.finalScoreA = document.getElementById('duel-final-score-a');
  els.finalScoreB = document.getElementById('duel-final-score-b');
  els.finalRecordA = document.getElementById('duel-final-record-a');
  els.finalRecordB = document.getElementById('duel-final-record-b');
  els.retryBtn = document.getElementById('duel-retry-btn');
  els.backBtn = document.getElementById('duel-back-btn');
}

function populateTopicSelect() {
  els.topicSelect.innerHTML = TOPICS.map((t) => `<option value="${t.key}">${t.label}</option>`).join('');
}

function formatRecord(profileId) {
  const { wins, losses, ties } = computeDuelStats(getProgress(profileId));
  return ties > 0 ? `🏆 ${wins}W – ${losses}L – ${ties}T` : `🏆 ${wins}W – ${losses}L`;
}

function populateProfileSelects() {
  const profiles = listProfiles();
  const options = profiles.map((p) => `<option value="${p.id}">${p.name}</option>`).join('');
  els.playerASelect.innerHTML = options;
  els.playerBSelect.innerHTML = options;
  if (profiles.length > 1) els.playerBSelect.value = profiles[1].id;

  const enoughProfiles = profiles.length >= 2;
  els.startBtn.disabled = !enoughProfiles;
  if (!enoughProfiles) {
    els.setupError.textContent = 'Duel Mode needs at least 2 profiles. Add another profile first.';
    els.setupError.hidden = false;
  } else {
    els.setupError.hidden = true;
  }
  updateRecordDisplays();
}

function updateRecordDisplays() {
  if (els.playerASelect.value) els.playerARecord.textContent = formatRecord(els.playerASelect.value);
  if (els.playerBSelect.value) els.playerBRecord.textContent = formatRecord(els.playerBSelect.value);
}

function renderGrid(gridEl, choices, keyLabels) {
  gridEl.innerHTML = '';
  choices.forEach((choice, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice-btn';
    btn.dataset.index = String(index);
    const key = document.createElement('span');
    key.className = 'choice-key';
    key.textContent = keyLabels[index];
    const value = document.createElement('span');
    value.className = 'choice-value';
    value.textContent = choice;
    btn.append(key, value);
    gridEl.appendChild(btn);
  });
}

function startRound() {
  state.roundOver = false;
  state.locked = [false, false];

  const rng = createRng(state.baseSeed + state.roundIndex);
  state.currentProblem = state.topic.generate(rng, ...state.topic.args);

  els.roundBanner.hidden = true;
  els.roundText.textContent = `Round ${state.roundIndex + 1} of ${state.totalRounds}`;
  els.prompt.textContent = state.topic.renderPrompt(state.currentProblem);
  els.scoreA.textContent = `Score: ${state.scores[0]}`;
  els.scoreB.textContent = `Score: ${state.scores[1]}`;

  renderGrid(els.choicesA, state.currentProblem.choices, PLAYER_A_KEY_LABELS);
  renderGrid(els.choicesB, state.currentProblem.choices, PLAYER_B_KEY_LABELS);
}

function revealCorrectAnswer(winnerIndex) {
  const correctDisplay = state.currentProblem.answerDisplay;
  [els.choicesA, els.choicesB].forEach((gridEl, playerIndex) => {
    const buttons = Array.from(gridEl.querySelectorAll('.choice-btn'));
    for (const btn of buttons) {
      btn.disabled = true;
      const isThisCorrect = state.currentProblem.choices[Number(btn.dataset.index)] === correctDisplay;
      if (isThisCorrect && !(winnerIndex === playerIndex && btn.classList.contains('correct'))) {
        btn.classList.add('reveal-correct');
      }
    }
  });
}

function finishRound(winnerIndex) {
  revealCorrectAnswer(winnerIndex);

  if (winnerIndex === null) {
    els.roundBanner.classList.remove('correct', 'incorrect');
    els.roundBanner.textContent = `Nobody got it — the answer was ${state.currentProblem.answerDisplay}.`;
  } else {
    state.scores[winnerIndex] += 1;
    els.roundBanner.classList.remove('incorrect');
    els.roundBanner.classList.add('correct');
    els.roundBanner.textContent = `${state.playerNames[winnerIndex]} scores! 🎉`;
    playCorrectSound();
    animateFeedback(els.roundBanner, true);
  }
  els.roundBanner.hidden = false;
  els.scoreA.textContent = `Score: ${state.scores[0]}`;
  els.scoreB.textContent = `Score: ${state.scores[1]}`;

  setTimeout(() => {
    state.roundIndex += 1;
    if (state.roundIndex >= state.totalRounds) showMatchResults();
    else startRound();
  }, ROUND_PAUSE_MS);
}

function handleGridClick(playerIndex, event) {
  if (!state || state.roundOver || state.locked[playerIndex] || els.activeSection.hidden) return;
  const btn = event.target.closest('.choice-btn');
  if (!btn) return;
  const index = Number(btn.dataset.index);
  const chosen = state.currentProblem.choices[index];
  const isCorrect = chosen === state.currentProblem.answerDisplay;

  // Only a player who actually clicked gets a logged problem result for this
  // round — a player who never got a chance (the other player answered
  // first) isn't counted as having missed it.
  state.results[playerIndex].push({
    generatorId: state.topic.generatorId,
    difficulty: null,
    seed: state.baseSeed + state.roundIndex,
    correct: isCorrect,
    userAnswer: chosen,
    timeMs: 0,
    promptText: state.currentProblem.promptText,
    answerDisplay: state.currentProblem.answerDisplay,
    choices: state.currentProblem.choices,
  });

  if (isCorrect) {
    state.roundOver = true;
    btn.classList.add('correct');
    animateFeedback(btn, true);
    finishRound(playerIndex);
    return;
  }

  state.locked[playerIndex] = true;
  btn.disabled = true;
  btn.classList.add('incorrect');
  animateFeedback(btn, false);
  playIncorrectSound();

  if (state.locked[0] && state.locked[1]) {
    state.roundOver = true;
    finishRound(null);
  }
}

function handleKeydown(event) {
  if (!state || els.activeSection.hidden || event.repeat) return;
  const target = event.target;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

  let playerIndex = null;
  let index = PLAYER_A_CODES.indexOf(event.code);
  if (index !== -1) {
    playerIndex = 0;
  } else {
    index = PLAYER_B_CODES.indexOf(event.code);
    if (index === -1) index = PLAYER_B_NUMPAD_CODES.indexOf(event.code);
    if (index !== -1) playerIndex = 1;
  }
  if (playerIndex === null) return;

  // Routing through the button's own click() (a no-op while disabled) reuses
  // handleGridClick's locked/round-over checks instead of duplicating them.
  const gridEl = playerIndex === 0 ? els.choicesA : els.choicesB;
  const btn = gridEl.querySelector(`.choice-btn[data-index="${index}"]`);
  if (btn) btn.click();
}

function outcomeFor(winner, playerKey) {
  if (winner === 'tie') return 'tie';
  return winner === playerKey ? 'win' : 'loss';
}

function showMatchResults() {
  els.activeSection.hidden = true;
  els.resultsSection.hidden = false;

  const [scoreA, scoreB] = state.scores;
  const [nameA, nameB] = state.playerNames;
  els.finalScoreA.textContent = `${nameA}: ${scoreA}`;
  els.finalScoreB.textContent = `${nameB}: ${scoreB}`;

  const winner = determineWinner(scoreA, scoreB);
  els.winnerBanner.textContent = winner === 'tie' ? "🤝 It's a tie!" : `🏆 ${winner === 'a' ? nameA : nameB} wins!`;
  playCorrectSound();
  animateFeedback(els.winnerBanner, true);
  // Both players share this one results screen, so (unlike a solo game) this
  // always shows a "good" celebration — a win/tie for a fun 2-player match
  // isn't a pass/fail result to encourage one side out of.
  showCelebration(els.celebrationImage, pickGoodCelebration());

  const startedAt = state.startedAt;
  const completedAt = new Date().toISOString();
  recordQuizAttempt(state.profileIds[0], {
    type: 'duel',
    grade: null,
    topics: [state.topic.key],
    difficulty: null,
    startedAt,
    completedAt,
    problems: state.results[0],
    outcome: outcomeFor(winner, 'a'),
    opponentName: nameB,
    score: scoreA,
    opponentScore: scoreB,
    rounds: state.totalRounds,
  });
  recordQuizAttempt(state.profileIds[1], {
    type: 'duel',
    grade: null,
    topics: [state.topic.key],
    difficulty: null,
    startedAt,
    completedAt,
    problems: state.results[1],
    outcome: outcomeFor(winner, 'b'),
    opponentName: nameA,
    score: scoreB,
    opponentScore: scoreA,
    rounds: state.totalRounds,
  });

  els.finalRecordA.textContent = formatRecord(state.profileIds[0]);
  els.finalRecordB.textContent = formatRecord(state.profileIds[1]);
}

function startMatch() {
  const profileAId = els.playerASelect.value;
  const profileBId = els.playerBSelect.value;
  if (!profileAId || !profileBId || profileAId === profileBId) {
    els.setupError.textContent = 'Choose two different profiles to duel.';
    els.setupError.hidden = false;
    return;
  }
  els.setupError.hidden = true;

  const topic = TOPICS.find((t) => t.key === els.topicSelect.value) || TOPICS[0];
  const nameA = getProfile(profileAId).name;
  const nameB = getProfile(profileBId).name;

  state = {
    topic,
    profileIds: [profileAId, profileBId],
    playerNames: [nameA, nameB],
    totalRounds: Number(els.roundsSelect.value),
    baseSeed: randomSeed(),
    roundIndex: 0,
    scores: [0, 0],
    roundOver: false,
    locked: [false, false],
    currentProblem: null,
    results: [[], []],
    startedAt: new Date().toISOString(),
  };

  els.playerAName.textContent = nameA;
  els.playerBName.textContent = nameB;

  els.setupSection.hidden = true;
  els.resultsSection.hidden = true;
  els.activeSection.hidden = false;
  startRound();
}

function backToSetup() {
  state = null;
  els.resultsSection.hidden = true;
  els.activeSection.hidden = true;
  els.setupSection.hidden = false;
  updateRecordDisplays();
}

export function init() {
  cacheElements();
  renderNav('games.html');
  populateTopicSelect();
  populateProfileSelects();

  els.startBtn.addEventListener('click', startMatch);
  els.choicesA.addEventListener('click', (e) => handleGridClick(0, e));
  els.choicesB.addEventListener('click', (e) => handleGridClick(1, e));
  els.retryBtn.addEventListener('click', startMatch);
  els.backBtn.addEventListener('click', backToSetup);
  els.playerASelect.addEventListener('change', updateRecordDisplays);
  els.playerBSelect.addEventListener('change', updateRecordDisplays);
  window.addEventListener('keydown', handleKeydown);
}
