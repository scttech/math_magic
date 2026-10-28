// The named landmarks Coordinate Treasure Hunt hunts for — "Find the Forest
// Trail at (3, 5)" instead of a plain "X marks the spot" — and the emoji
// shown when one is found. No image assets, consistent with the rest of the
// site's emoji-as-icon use (lives as ❤️, badge icons, etc.).
import { shuffle } from '../core/rng.js';

export const LANDMARKS = [
  { name: 'Forest Trail', icon: '🌲' },
  { name: 'Skull Rock', icon: '💀' },
  { name: 'Hidden Cave', icon: '🕳️' },
  { name: 'Shipwreck Cove', icon: '⛵' },
  { name: 'Palm Grove', icon: '🌴' },
  { name: 'Sandy Lagoon', icon: '🏖️' },
  { name: 'Coral Reef', icon: '🐚' },
  { name: 'Old Lighthouse', icon: '🗼' },
  { name: 'Buried Chest', icon: '💰' },
  { name: 'Volcano Peak', icon: '🌋' },
  { name: 'Stone Fortress', icon: '🏰' },
  { name: "Parrot's Perch", icon: '🦜' },
  { name: 'Anchor Bay', icon: '⚓' },
  { name: 'Mermaid Grotto', icon: '🧜‍♀️' },
  { name: "Kraken's Lair", icon: '🐙' },
  { name: 'Bone Yard', icon: '🦴' },
  { name: 'Turtle Beach', icon: '🐢' },
  { name: 'Castaway Hut', icon: '🛖' },
  { name: 'Golden Cove', icon: '🪙' },
  { name: 'Rip Tide Shallows', icon: '🌊' },
];

/**
 * A no-repeat-until-exhausted sequence of landmarks: every landmark is drawn
 * exactly once before any of them repeat (a shuffled "deck"), reshuffling
 * automatically for the next lap once it runs out — including a check that
 * the reshuffle's first draw isn't the same landmark the previous lap just
 * ended on, so two calls to next() are never the same landmark back-to-back
 * even right at that boundary. A game session (Coordinate Treasure Hunt
 * offers up to 15 treasures per game, well under LANDMARKS.length) should
 * never even need a second lap, but this stays correct if that cap ever grows.
 */
export function createLandmarkSequence(rng) {
  let deck = shuffle(rng, LANDMARKS);
  let index = 0;
  let lastDrawn = null;

  function reshuffle() {
    deck = shuffle(rng, LANDMARKS);
    if (deck.length > 1 && lastDrawn && deck[0] === lastDrawn) {
      [deck[0], deck[1]] = [deck[1], deck[0]];
    }
    index = 0;
  }

  return {
    next() {
      if (index >= deck.length) reshuffle();
      const landmark = deck[index];
      index += 1;
      lastDrawn = landmark;
      return landmark;
    },
  };
}
