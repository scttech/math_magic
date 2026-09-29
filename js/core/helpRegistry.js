// Maps a generator id to a function that builds this specific problem
// instance's help-page URL. Views (currently quizView) only need to ask
// "does this problem have help, and if so where does it go?" — they don't
// need to know anything about how each topic's help content actually works;
// that lives in helpView.js and wherever each topic keeps its content (e.g.
// wordProblemPatterns.js's explain()). A generator that supports help calls
// registerHelpProvider once, as a side effect of being imported.
const urlBuildersById = new Map();

export function registerHelpProvider(generatorId, buildUrl) {
  urlBuildersById.set(generatorId, buildUrl);
}

export function hasHelp(generatorId) {
  return urlBuildersById.has(generatorId);
}

export function buildHelpUrl(problem) {
  const build = urlBuildersById.get(problem.meta.generatorId);
  return build ? build(problem) : null;
}
