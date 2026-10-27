// A generic version of the number/range spec parser multiplicationTables.js
// pioneered (e.g. "2", "2,4,6", "1-12", "2,5-7"), parameterized by min/max so
// addition/subtraction/division fact drills can each declare their own
// allowed bounds instead of multiplicationTables.js's fixed 0-20.
export function parseNumberSpec(spec, min, max) {
  if (typeof spec !== 'string') return null;
  const parts = spec
    .trim()
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return null;

  const values = new Set();
  for (const part of parts) {
    const rangeMatch = /^(\d+)\s*-\s*(\d+)$/.exec(part);
    if (rangeMatch) {
      let lo = Number(rangeMatch[1]);
      let hi = Number(rangeMatch[2]);
      if (lo > hi) [lo, hi] = [hi, lo];
      if (lo < min || hi > max) return null;
      for (let v = lo; v <= hi; v++) values.add(v);
    } else if (/^\d+$/.test(part)) {
      const v = Number(part);
      if (v < min || v > max) return null;
      values.add(v);
    } else {
      return null;
    }
  }
  return values.size > 0 ? Array.from(values).sort((a, b) => a - b) : null;
}
