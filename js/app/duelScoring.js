// Pure win-determination logic for Duel Mode, kept separate from duelView.js
// (which is DOM-heavy) so it's directly unit-testable.

/** @returns {'a'|'b'|'tie'} */
export function determineWinner(scoreA, scoreB) {
  if (scoreA > scoreB) return 'a';
  if (scoreB > scoreA) return 'b';
  return 'tie';
}
