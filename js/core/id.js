// Short, unique-enough IDs for local records (profiles, quiz attempts,
// worksheets). Not cryptographic — just needs to not collide within one
// browser's storage.
export function generateId(prefix) {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${random}`;
}
