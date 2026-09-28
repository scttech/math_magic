// Central catalog of problem-generator modules. Quiz and Worksheet views read
// from this registry only — they never import generator modules directly —
// so adding a new grade/topic later means registering new modules here, with
// no changes to the views or this file.

const modulesById = new Map();

/**
 * @param {import('./problemGenerator.js')} mod - a ProblemGeneratorModule
 */
export function register(mod) {
  if (!mod || !mod.id) {
    throw new Error('registry.register: module must have an id');
  }
  if (modulesById.has(mod.id)) {
    throw new Error(`registry.register: duplicate generator id "${mod.id}"`);
  }
  modulesById.set(mod.id, mod);
}

export function getById(id) {
  return modulesById.get(id);
}

export function getAll() {
  return Array.from(modulesById.values());
}

export function getByGrade(grade) {
  return getAll().filter((mod) => mod.grade === String(grade));
}

export function getByTopic(grade, topic) {
  return getByGrade(grade).filter((mod) => mod.topic === topic);
}

export function listGrades() {
  return Array.from(new Set(getAll().map((mod) => mod.grade))).sort();
}

export function listTopics(grade) {
  return Array.from(new Set(getByGrade(grade).map((mod) => mod.topic)));
}
