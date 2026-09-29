// Decides whether a problem has help, and where its help page is.
//
// The default path needs no registration at all: any generator already in
// the grade/topic registry (registry.js) that defines an `explain(meta)`
// method automatically gets help — its URL just carries the generator id and
// its own meta. registerHelpProvider() is only an escape hatch for content
// that lives outside that registry (e.g. a future grade-agnostic skill).
import { getById } from './registry.js';

const manualUrlBuildersById = new Map();

export function registerHelpProvider(generatorId, buildUrl) {
  manualUrlBuildersById.set(generatorId, buildUrl);
}

function defaultBuildUrl(problem) {
  const params = new URLSearchParams({
    generatorId: problem.meta.generatorId,
    meta: JSON.stringify(problem.meta),
    prompt: problem.promptText,
    answer: problem.answerDisplay,
  });
  return `help.html?${params.toString()}`;
}

export function hasHelp(generatorId) {
  if (manualUrlBuildersById.has(generatorId)) return true;
  const mod = getById(generatorId);
  return !!(mod && typeof mod.explain === 'function');
}

export function buildHelpUrl(problem) {
  const manual = manualUrlBuildersById.get(problem.meta.generatorId);
  if (manual) return manual(problem);
  return hasHelp(problem.meta.generatorId) ? defaultBuildUrl(problem) : null;
}
