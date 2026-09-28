import { topicLabel } from '../app/topicLabels.js';
import { CHART_COLORS, STATUS_TIERS, accuracyStatus, formatPercent, roundedEndBarPathH, createTooltip, createTableToggle } from './chartTheme.js';

const BAR_THICKNESS = 20;
const ROW_HEIGHT = 36;
const MARGIN = { top: 8, right: 56, bottom: 8, left: 190 };

function buildTable(data) {
  const table = document.createElement('table');
  table.className = 'results-table chart-table';
  table.innerHTML = `
    <thead><tr><th>Topic</th><th>Correct</th><th>Total</th><th>Accuracy</th></tr></thead>
    <tbody>
      ${data
        .map(
          (d) => `<tr><td>${topicLabel(d.topic)}</td><td>${d.correct}</td><td>${d.total}</td><td>${formatPercent(d.accuracy)}</td></tr>`
        )
        .join('')}
    </tbody>`;
  return table;
}

export function renderAccuracyByTopicChart(containerEl, data) {
  containerEl.innerHTML = '';
  if (data.length === 0) return;

  const width = Math.max(containerEl.clientWidth || 640, 320);
  const height = data.length * ROW_HEIGHT + MARGIN.top + MARGIN.bottom;
  const plotWidth = width - MARGIN.left - MARGIN.right;

  const svg = d3.create('svg').attr('viewBox', `0 0 ${width} ${height}`).attr('width', '100%').attr('height', height).attr('role', 'img').attr('aria-label', 'Accuracy by topic bar chart');

  const x = d3.scaleLinear().domain([0, 1]).range([0, plotWidth]);
  const y = d3
    .scaleBand()
    .domain(data.map((d) => d.topic))
    .range([0, data.length * ROW_HEIGHT])
    .paddingInner(0);

  const plot = svg.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

  // Gridlines at 0/25/50/75/100%.
  plot
    .append('g')
    .selectAll('line')
    .data([0, 0.25, 0.5, 0.75, 1])
    .join('line')
    .attr('x1', (d) => x(d))
    .attr('x2', (d) => x(d))
    .attr('y1', 0)
    .attr('y2', data.length * ROW_HEIGHT)
    .attr('stroke', CHART_COLORS.gridline)
    .attr('stroke-width', 1);

  const tooltip = createTooltip(containerEl);

  const rows = plot
    .selectAll('g.bar-row')
    .data(data)
    .join('g')
    .attr('class', 'bar-row')
    .attr('transform', (d) => `translate(0,${y(d.topic)})`);

  rows
    .append('text')
    .attr('x', -12)
    .attr('y', ROW_HEIGHT / 2)
    .attr('dy', '0.32em')
    .attr('text-anchor', 'end')
    .attr('fill', CHART_COLORS.textSecondary)
    .attr('font-size', 13)
    .text((d) => topicLabel(d.topic));

  const barY = (ROW_HEIGHT - BAR_THICKNESS) / 2;

  rows
    .append('path')
    .attr('d', (d) => roundedEndBarPathH(0, barY, Math.max(x(d.accuracy), 2), BAR_THICKNESS, 4))
    .attr('fill', (d) => CHART_COLORS.status[accuracyStatus(d.accuracy)]);

  rows
    .append('text')
    .attr('x', (d) => x(d.accuracy) + 8)
    .attr('y', ROW_HEIGHT / 2)
    .attr('dy', '0.32em')
    .attr('fill', CHART_COLORS.textPrimary)
    .attr('font-size', 13)
    .attr('font-weight', 600)
    .text((d) => formatPercent(d.accuracy));

  // Full-row hit target (bigger than the bar itself) for hover/focus tooltips.
  rows
    .append('rect')
    .attr('x', -MARGIN.left)
    .attr('y', 0)
    .attr('width', plotWidth + MARGIN.left + MARGIN.right)
    .attr('height', ROW_HEIGHT)
    .attr('fill', 'transparent')
    .attr('tabindex', 0)
    .attr('role', 'button')
    .attr('aria-label', (d) => `${topicLabel(d.topic)}: ${d.correct} of ${d.total} correct, ${formatPercent(d.accuracy)}`)
    .on('pointerenter pointermove focus', function (event, d) {
      const [px, py] = d3.pointer(event, containerEl);
      tooltip.show(
        `<strong>${formatPercent(d.accuracy)}</strong><br>${topicLabel(d.topic)}<br>${d.correct} / ${d.total} correct`,
        px + 12,
        py - 12
      );
    })
    .on('pointerleave blur', () => tooltip.hide());

  containerEl.appendChild(svg.node());

  // Legend for the status tiers, since color here carries an accuracy-tier meaning.
  const legend = document.createElement('div');
  legend.className = 'chart-legend';
  legend.innerHTML = STATUS_TIERS.map(
    (tier) => `<span class="chart-legend-item"><span class="chart-legend-swatch" style="background:${CHART_COLORS.status[tier.key]}"></span>${tier.label}</span>`
  ).join('');
  containerEl.appendChild(legend);

  const table = buildTable(data);
  containerEl.appendChild(table);
  createTableToggle(containerEl, svg.node(), table);
}
