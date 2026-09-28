// Shared color roles, status-tier logic, and small chart utilities used by
// both chart modules. Colors mostly mirror the site's own design tokens
// (css/base.css); the status palette is the dataviz skill's fixed,
// never-themed status colors (good/warning/critical), used here to mean
// "mastered / developing / needs practice" — always paired with a direct %
// label so the color is never the only signal, per that skill's rules.
export const CHART_COLORS = {
  surface: '#ffffff',
  textPrimary: '#2b2b33',
  textSecondary: '#5c5c66',
  textMuted: '#898781',
  gridline: '#e1e0d9',
  baseline: '#c3c2b7',
  line: '#4a6fd9',
  status: {
    good: '#0ca30c',
    warning: '#fab219',
    critical: '#d03b3b',
  },
};

export const STATUS_TIERS = [
  { key: 'good', label: 'Strong (85%+)', min: 0.85 },
  { key: 'warning', label: 'Developing (60-84%)', min: 0.6 },
  { key: 'critical', label: 'Needs Practice (<60%)', min: -Infinity },
];

export function accuracyStatus(accuracy) {
  return STATUS_TIERS.find((tier) => accuracy >= tier.min).key;
}

export function formatPercent(accuracy) {
  return `${Math.round(accuracy * 100)}%`;
}

/** A rounded-rect path for a horizontal bar: square at the baseline (x0), rounded at the data end (x1). */
export function roundedEndBarPathH(x0, y0, x1, height, radius) {
  const h = height;
  const r = Math.min(radius, h / 2, Math.max(0, x1 - x0));
  if (x1 - x0 <= 0) return `M${x0},${y0} h0 v${h} h0 Z`;
  return `M${x0},${y0} H${x1 - r} Q${x1},${y0} ${x1},${y0 + r} V${y0 + h - r} Q${x1},${y0 + h} ${x1 - r},${y0 + h} H${x0} Z`;
}

/** A single shared tooltip element, reused across a chart's marks. */
export function createTooltip(containerEl) {
  const el = document.createElement('div');
  el.className = 'chart-tooltip';
  el.hidden = true;
  containerEl.appendChild(el);
  return {
    show(html, x, y) {
      el.innerHTML = html;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.hidden = false;
    },
    hide() {
      el.hidden = true;
    },
  };
}

/**
 * Wires a "View as table" toggle button that swaps between the chart SVG and
 * an HTML table. Uses style.display rather than the `hidden` property/attribute:
 * `.hidden` is an HTMLElement IDL property and isn't reliably reflected on an
 * <svg> element, so setting it there silently no-ops instead of hiding it.
 */
export function createTableToggle(containerEl, svgEl, tableEl) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn secondary chart-table-toggle';
  btn.textContent = 'View as Table';
  tableEl.style.display = 'none';
  let tableVisible = false;
  btn.addEventListener('click', () => {
    tableVisible = !tableVisible;
    tableEl.style.display = tableVisible ? '' : 'none';
    svgEl.style.display = tableVisible ? 'none' : '';
    btn.textContent = tableVisible ? 'View as Chart' : 'View as Table';
  });
  containerEl.appendChild(btn);
  return btn;
}
