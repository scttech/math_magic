import '../app/init.js';
import { renderNav } from '../app/nav.js';
import { getPatternById } from '../core/wordProblemPatterns.js';

const els = {};

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function cacheElements() {
  els.content = document.getElementById('help-content');
  els.notFound = document.getElementById('help-not-found');
  els.context = document.getElementById('help-context');
  els.label = document.getElementById('help-label');
  els.description = document.getElementById('help-description');
  els.strategySteps = document.getElementById('help-strategy-steps');
  els.showWorkedBtn = document.getElementById('show-worked-solution-btn');
  els.workedSolution = document.getElementById('worked-solution');
  els.workedSteps = document.getElementById('worked-solution-steps');
  els.workedAnswer = document.getElementById('worked-solution-answer');
  els.closeTabBtn = document.getElementById('close-tab-btn');
}

function parseParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    type: params.get('type'),
    patternId: params.get('patternId'),
    values: params.get('values'),
    prompt: params.get('prompt'),
    answer: params.get('answer'),
  };
}

function showNotFound() {
  els.content.hidden = true;
  els.notFound.hidden = false;
}

function renderWordProblemHelp(params) {
  const pattern = getPatternById(params.patternId);
  if (!pattern || typeof pattern.explain !== 'function') {
    showNotFound();
    return;
  }

  let values;
  try {
    values = JSON.parse(params.values);
  } catch {
    showNotFound();
    return;
  }

  const { strategy, workedSteps, finalAnswerDisplay } = pattern.explain(values);

  els.context.textContent = params.prompt ? `You were working on: "${params.prompt}"` : '';
  els.label.textContent = pattern.label;
  els.description.textContent = pattern.description;
  els.strategySteps.innerHTML = strategy.map((step) => `<li>${escapeHtml(step)}</li>`).join('');

  els.showWorkedBtn.addEventListener('click', () => {
    els.workedSteps.innerHTML = workedSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join('');
    els.workedAnswer.textContent = `Final answer: ${params.answer || finalAnswerDisplay}`;
    els.workedSolution.hidden = false;
    els.showWorkedBtn.hidden = true;
  });
}

export function init() {
  cacheElements();
  renderNav(null);

  const params = parseParams();
  if (params.type === 'wordProblem') {
    renderWordProblemHelp(params);
  } else {
    showNotFound();
  }

  els.closeTabBtn.addEventListener('click', () => window.close());
}
