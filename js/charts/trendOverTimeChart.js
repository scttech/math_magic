import { CHART_COLORS, formatPercent, createTooltip, createTableToggle } from './chartTheme.js';

const MARGIN = { top: 16, right: 24, bottom: 28, left: 40 };
const MARKER_RADIUS = 5;

function formatWeekLabel(bucketStart) {
  const d = new Date(bucketStart);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function buildTable(data) {
  const table = document.createElement('table');
  table.className = 'results-table chart-table';
  table.innerHTML = `
    <thead><tr><th>Week of</th><th>Correct</th><th>Total</th><th>Accuracy</th></tr></thead>
    <tbody>
      ${data.map((d) => `<tr><td>${formatWeekLabel(d.bucketStart)}</td><td>${d.correct}</td><td>${d.total}</td><td>${formatPercent(d.accuracy)}</td></tr>`).join('')}
    </tbody>`;
  return table;
}

export function renderTrendChart(containerEl, data) {
  containerEl.innerHTML = '';

  if (data.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'chart-empty';
    empty.textContent = 'Not enough data yet for this filter.';
    containerEl.appendChild(empty);
    return;
  }

  const width = Math.max(containerEl.clientWidth || 640, 320);
  const height = 260;
  const plotWidth = width - MARGIN.left - MARGIN.right;
  const plotHeight = height - MARGIN.top - MARGIN.bottom;

  const x = d3
    .scalePoint()
    .domain(data.map((d) => d.bucketStart))
    .range([0, plotWidth])
    .padding(0.5);
  const y = d3.scaleLinear().domain([0, 1]).range([plotHeight, 0]);

  const svg = d3.create('svg').attr('viewBox', `0 0 ${width} ${height}`).attr('width', '100%').attr('height', height).attr('role', 'img').attr('aria-label', 'Accuracy trend over time line chart');
  const plot = svg.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  plot
    .append('g')
    .selectAll('line')
    .data(yTicks)
    .join('line')
    .attr('x1', 0)
    .attr('x2', plotWidth)
    .attr('y1', (d) => y(d))
    .attr('y2', (d) => y(d))
    .attr('stroke', CHART_COLORS.gridline)
    .attr('stroke-width', 1);

  plot
    .append('g')
    .selectAll('text')
    .data(yTicks)
    .join('text')
    .attr('x', -8)
    .attr('y', (d) => y(d))
    .attr('dy', '0.32em')
    .attr('text-anchor', 'end')
    .attr('fill', CHART_COLORS.textMuted)
    .attr('font-size', 11)
    .text((d) => `${Math.round(d * 100)}%`);

  const tickStep = Math.max(1, Math.ceil(data.length / 6));
  plot
    .append('g')
    .selectAll('text')
    .data(data.filter((_, i) => i % tickStep === 0))
    .join('text')
    .attr('x', (d) => x(d.bucketStart))
    .attr('y', plotHeight + 18)
    .attr('text-anchor', 'middle')
    .attr('fill', CHART_COLORS.textMuted)
    .attr('font-size', 11)
    .text((d) => formatWeekLabel(d.bucketStart));

  if (data.length > 1) {
    const area = d3
      .area()
      .x((d) => x(d.bucketStart))
      .y0(plotHeight)
      .y1((d) => y(d.accuracy));
    plot.append('path').datum(data).attr('d', area).attr('fill', CHART_COLORS.line).attr('fill-opacity', 0.1);

    const line = d3
      .line()
      .x((d) => x(d.bucketStart))
      .y((d) => y(d.accuracy));
    plot
      .append('path')
      .datum(data)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', CHART_COLORS.line)
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round');
  }

  plot
    .selectAll('circle')
    .data(data)
    .join('circle')
    .attr('cx', (d) => x(d.bucketStart))
    .attr('cy', (d) => y(d.accuracy))
    .attr('r', MARKER_RADIUS)
    .attr('fill', CHART_COLORS.line)
    .attr('stroke', CHART_COLORS.surface)
    .attr('stroke-width', 2);

  // Label only the last point, per "label the endpoint, not every point".
  const last = data[data.length - 1];
  plot
    .append('text')
    .attr('x', x(last.bucketStart))
    .attr('y', y(last.accuracy) - 12)
    .attr('text-anchor', 'middle')
    .attr('fill', CHART_COLORS.textPrimary)
    .attr('font-size', 12)
    .attr('font-weight', 600)
    .text(formatPercent(last.accuracy));

  // Crosshair + hover/focus tooltip, snapping to the nearest week.
  const tooltip = createTooltip(containerEl);
  const crosshair = plot
    .append('line')
    .attr('y1', 0)
    .attr('y2', plotHeight)
    .attr('stroke', CHART_COLORS.baseline)
    .attr('stroke-width', 1)
    .attr('opacity', 0);

  plot
    .append('rect')
    .attr('width', plotWidth)
    .attr('height', plotHeight)
    .attr('fill', 'transparent')
    .attr('tabindex', 0)
    .attr('role', 'img')
    .attr('aria-label', 'Hover or focus to inspect weekly accuracy values')
    .on('pointerenter pointermove', function (event) {
      const [px] = d3.pointer(event, this);
      const step = plotWidth / Math.max(1, data.length - 1 || 1);
      const index = data.length === 1 ? 0 : Math.round(px / step);
      const d = data[Math.min(Math.max(index, 0), data.length - 1)];
      crosshair.attr('x1', x(d.bucketStart)).attr('x2', x(d.bucketStart)).attr('opacity', 1);
      const [tx, ty] = d3.pointer(event, containerEl);
      tooltip.show(`<strong>${formatPercent(d.accuracy)}</strong><br>Week of ${formatWeekLabel(d.bucketStart)}<br>${d.correct} / ${d.total} correct`, tx + 12, ty - 12);
    })
    .on('pointerleave blur', () => {
      crosshair.attr('opacity', 0);
      tooltip.hide();
    });

  containerEl.appendChild(svg.node());

  const table = buildTable(data);
  containerEl.appendChild(table);
  createTableToggle(containerEl, svg.node(), table);
}
