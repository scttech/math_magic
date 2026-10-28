// The pirate's intro dialogue for Coordinate Treasure Hunt's skippable intro
// — one line is picked at random per slide each time the intro plays. Same
// shared-across-every-profile, localStorage-backed, seed-on-first-read
// pattern as wordListStore.js, just two categories (one per intro slide)
// holding full sentences instead of single words.
const DIALOGUE_KEY = 'mathmagic.treasureDialogue';

export const DEFAULT_DIALOGUE = {
  ship: [
    "Ahoy, matey! I be in need of a sharp navigator to help me find buried treasure on the high seas!",
    "Arrr! Me compass be spinnin' in circles — I need someone clever with numbers to chart our course!",
    "Land ho! But the X on me map won't find itself. Care to lend a hand, matey?",
    "Hoist the sails! There be treasure waitin', but only a sharp navigator can plot the way!",
  ],
  map: [
    "This old map hides its clues in riddles o' numbers... Solve the coordinates, and the treasure be yours!",
    "Every X on this map be a puzzle. Plot it right, and we'll be rich as kings!",
    "The map's riddles be tricky, but I reckon a clever first mate like you can crack 'em!",
    "Study the map close now, matey — each treasure's hidin' at a secret coordinate!",
  ],
};

const CATEGORIES = Object.keys(DEFAULT_DIALOGUE);

function readLines() {
  try {
    const raw = JSON.parse(localStorage.getItem(DIALOGUE_KEY));
    if (!raw || typeof raw !== 'object') return null;
    return raw;
  } catch {
    return null;
  }
}

function writeLines(lines) {
  localStorage.setItem(DIALOGUE_KEY, JSON.stringify(lines));
}

function normalize(lines) {
  const result = {};
  for (const category of CATEGORIES) {
    const list = Array.isArray(lines[category]) ? lines[category].filter((l) => typeof l === 'string' && l.trim().length > 0) : [];
    result[category] = list.length > 0 ? list : [...DEFAULT_DIALOGUE[category]];
  }
  return result;
}

/** All dialogue line pools, seeding localStorage with defaults on first read. */
export function getDialogueLines() {
  const existing = readLines();
  if (existing) return normalize(existing);
  const seeded = { ...DEFAULT_DIALOGUE };
  writeLines(seeded);
  return seeded;
}

export function addDialogueLine(category, line) {
  const trimmed = (line || '').trim();
  if (!trimmed || !CATEGORIES.includes(category)) return getDialogueLines();
  const lines = getDialogueLines();
  const alreadyThere = lines[category].some((l) => l.toLowerCase() === trimmed.toLowerCase());
  if (!alreadyThere) {
    lines[category] = [...lines[category], trimmed];
    writeLines(lines);
  }
  return lines;
}

/** Removes a line, refusing to empty a category (there must always be something to say). */
export function removeDialogueLine(category, line) {
  const lines = getDialogueLines();
  if (!CATEGORIES.includes(category) || lines[category].length <= 1) return lines;
  lines[category] = lines[category].filter((l) => l !== line);
  writeLines(lines);
  return lines;
}

export function resetCategoryToDefaults(category) {
  if (!CATEGORIES.includes(category)) return getDialogueLines();
  const lines = getDialogueLines();
  lines[category] = [...DEFAULT_DIALOGUE[category]];
  writeLines(lines);
  return lines;
}

export { CATEGORIES as TREASURE_DIALOGUE_CATEGORIES };
