import '../app/init.js';
import { initSkillRunner } from '../app/skillRunner.js';
import { parseNumberSpec } from '../skills/numberSpec.js';
import { generateProblem, GENERATOR_ID, MIN_DENOMINATOR, MAX_DENOMINATOR } from '../skills/mixedNumbers.js';

function validateSetup(els) {
  const denominators = parseNumberSpec(els.denominatorInput.value, MIN_DENOMINATOR, MAX_DENOMINATOR);
  if (!denominators) {
    return { error: `Enter a valid number or range for the denominator(s), e.g. "5" or "2-10" (${MIN_DENOMINATOR}-${MAX_DENOMINATOR} only).` };
  }
  return { label: els.denominatorInput.value.trim(), args: [denominators] };
}

function renderPrompt(container, problem) {
  container.textContent = problem.promptText;
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
      retryBtn: 'skill-retry-btn',
      backBtn: 'skill-back-btn',
      blitzToggle: 'blitz-toggle',
      timerText: 'skill-timer-text',
      denominatorInput: 'denominator-input',
    },
    navPage: 'skills.html',
    generatorId: GENERATOR_ID,
    topics: ['mixedNumbers'],
    validateSetup,
    generateProblem,
    renderPrompt,
    notCorrectText: (problem) => `Not quite — the answer is ${problem.answerDisplay}`,
  });
}
