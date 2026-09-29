// The person/food/object word lists word-problem templates draw from.
// Shared across every profile in the browser (like site content, not
// per-student progress) under one localStorage key, seeded from defaults on
// first read.
const WORD_LISTS_KEY = 'mathmagic.wordLists';

export const DEFAULT_WORD_LISTS = {
  person: ['Carter', 'Maya', 'Owen', 'Aria', 'Liam', 'Zoe', 'Noah', 'Priya', 'Elena', 'Marcus'],
  food: ['bananas', 'apples', 'strawberries', 'granola', 'rice', 'flour', 'grapes', 'blueberries', 'cheese', 'pasta'],
  object: ['sticker', 'marble', 'pencil', 'trading card', 'book', 'toy car', 'balloon', 'puzzle piece'],
};

const CATEGORIES = Object.keys(DEFAULT_WORD_LISTS);

function readLists() {
  try {
    const raw = JSON.parse(localStorage.getItem(WORD_LISTS_KEY));
    if (!raw || typeof raw !== 'object') return null;
    return raw;
  } catch {
    return null;
  }
}

function writeLists(lists) {
  localStorage.setItem(WORD_LISTS_KEY, JSON.stringify(lists));
}

function normalize(lists) {
  const result = {};
  for (const category of CATEGORIES) {
    const list = Array.isArray(lists[category]) ? lists[category].filter((w) => typeof w === 'string' && w.trim().length > 0) : [];
    result[category] = list.length > 0 ? list : [...DEFAULT_WORD_LISTS[category]];
  }
  return result;
}

/** All word lists, seeding localStorage with defaults on first read. */
export function getWordLists() {
  const existing = readLists();
  if (existing) return normalize(existing);
  const seeded = { ...DEFAULT_WORD_LISTS };
  writeLists(seeded);
  return seeded;
}

export function addWord(category, word) {
  const trimmed = (word || '').trim();
  if (!trimmed || !CATEGORIES.includes(category)) return getWordLists();
  const lists = getWordLists();
  const alreadyThere = lists[category].some((w) => w.toLowerCase() === trimmed.toLowerCase());
  if (!alreadyThere) {
    lists[category] = [...lists[category], trimmed];
    writeLists(lists);
  }
  return lists;
}

/** Removes a word, refusing to empty a category (templates need at least one entry to draw from). */
export function removeWord(category, word) {
  const lists = getWordLists();
  if (!CATEGORIES.includes(category) || lists[category].length <= 1) return lists;
  lists[category] = lists[category].filter((w) => w !== word);
  writeLists(lists);
  return lists;
}

export function resetCategoryToDefaults(category) {
  if (!CATEGORIES.includes(category)) return getWordLists();
  const lists = getWordLists();
  lists[category] = [...DEFAULT_WORD_LISTS[category]];
  writeLists(lists);
  return lists;
}

export { CATEGORIES as WORD_LIST_CATEGORIES };
