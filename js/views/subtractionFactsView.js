import '../app/init.js';
import { initSkillRunner } from '../app/skillRunner.js';
import { parseNumberSpec } from '../skills/numberSpec.js';
import { generateProblem, GENERATOR_ID, MIN_VALUE, MAX_VALUE } from '../skills/subtractionFacts.js';

function validateSetup(els) {
  const numbersA = parseNumberSpec(els.firstInput.value, MIN_VALUE, MAX_VALUE);
  const numbersB = parseNumberSpec(els.secondInput.value, MIN_VALUE, MAX_VALUE);
  if (!numbersA || !numbersB) {
    return { error: `Enter a valid number or range for both boxes, e.g. "5" or "0-10" or "2,5-7" (${MIN_VALUE}-${MAX_VALUE} only).` };
  }
  return { label: `${els.firstInput.value.trim()} - ${els.secondInput.value.trim()}`, args: [numbersA, numbersB] };
}

function renderPrompt(container, problem) {
  container.textContent = `${problem.promptText} = ?`;
}

export function init() {
  initSkillRunner({
    elementIds: {
      setupSection: 'skill-setup',
      activeSection: 'skill-active',
      resultsSection: 'skill-results',
      countSelect: 'skill-count-select',
      setupError: 'skill-setup-error',
      startBtn: 'skill-start-btn',
      progressText: 'skill-progress-text',
      promptContainer: 'skill-equation',
      choices: 'skill-choices',
      feedback: 'skill-feedback',
      scoreSummary: 'skill-score-summary',
      celebrationImage: 'skill-celebration-image',
      retryBtn: 'skill-retry-btn',
      backBtn: 'skill-back-btn',
      blitzToggle: 'blitz-toggle',
      timerText: 'skill-timer-text',
      firstInput: 'first-number-input',
      secondInput: 'second-number-input',
    },
    navPage: 'skills.html',
    generatorId: GENERATOR_ID,
    topics: ['subtractionFacts'],
    validateSetup,
    generateProblem,
    renderPrompt,
    notCorrectText: (problem) => `Not quite — ${problem.promptText} = ${problem.answerDisplay}`,
  });
}
