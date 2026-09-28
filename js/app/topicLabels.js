// Human-readable topic names, shared by the Quiz and Worksheet Builder UIs.
// The registry only knows topic *keys* (e.g. "fractionsDecimals"); this is
// the one place that maps a key to display text.
export const TOPIC_LABELS = {
  fractionsDecimals: 'Fractions & Decimals',
  ratiosProportions: 'Ratios & Proportions',
  negativeNumbers: 'Negative Numbers',
  expressionsEquations: 'Expressions & Equations',
  areaSurfaceVolume: 'Area, Surface Area & Volume',
  statistics: 'Statistics',
  multiplicationTables: 'Multiplication Tables',
};

export function topicLabel(topicKey) {
  return TOPIC_LABELS[topicKey] || topicKey;
}
