// Three number-line data displays for 6.SP.B.4 (dot plots, histograms, box
// plots), rendered with d3 (global — see chartTheme.js for why chart modules
// don't import it). Same deal as coordinatePlane.js: one function per chart
// type, each just mounts an SVG into whatever container it's given, so the
// same code renders into the Quiz view, the Worksheet Builder, and print.
import { CHART_COLORS } from './chartTheme.js';

function baseSvg(width, height, label) {
  return d3
    .create('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('width', width)
    .attr('height', height)
    .attr('role', 'img')
    .attr('aria-label', label)
    .style('print-color-adjust', 'exact')
    .style('-webkit-print-color-adjust', 'exact');
}

/**
 * @param {HTMLElement} containerEl
 * @param {object} config
 * @param {number[]} config.values - raw data points (each dot is one occurrence)
 * @param {number} [config.size=280] - pixel width
 */
export function renderDotPlot(containerEl, config) {
  containerEl.innerHTML = '';
  const { values, size = 280 } = config;

  const counts = new Map();
  for (const v of values) counts.set(v, (counts.get(v) || 0) + 1);
  const maxCount = Math.max(...counts.values());

  const margin = { top: 16, right: 24, bottom: 30, left: 24 };
  const width = size;
  const plotWidth = width - margin.left - margin.right;
  const dotRadius = 7;
  const dotStep = dotRadius * 2 + 3;
  const axisY = margin.top + maxCount * dotStep;
  const height = axisY + margin.bottom;

  const domainMin = Math.min(...values);
  const domainMax = Math.max(...values);
  const pad = Math.max(1, (domainMax - domainMin) * 0.15) || 1;
  const x = d3
    .scaleLinear()
    .domain([domainMin - pad, domainMax + pad])
    .range([margin.left, margin.left + plotWidth]);

  const svg = baseSvg(width, height, 'Dot plot');

  svg
    .append('line')
    .attr('x1', margin.left)
    .attr('x2', margin.left + plotWidth)
    .attr('y1', axisY)
    .attr('y2', axisY)
    .attr('stroke', CHART_COLORS.textSecondary)
    .attr('stroke-width', 1.5);

  const tickStart = Math.ceil(domainMin - pad);
  const tickEnd = Math.floor(domainMax + pad);
  const tickStep = tickEnd - tickStart > 16 ? 2 : 1;
  for (let v = tickStart; v <= tickEnd; v += tickStep) {
    svg
      .append('line')
      .attr('x1', x(v))
      .attr('x2', x(v))
      .attr('y1', axisY)
      .attr('y2', axisY + 4)
      .attr('stroke', CHART_COLORS.textSecondary)
      .attr('stroke-width', 1);
    svg
      .append('text')
      .attr('x', x(v))
      .attr('y', axisY + 16)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .attr('fill', CHART_COLORS.textMuted)
      .text(v);
  }

  for (const [value, count] of counts) {
    for (let i = 0; i < count; i++) {
      svg
        .append('circle')
        .attr('cx', x(value))
        .attr('cy', axisY - dotRadius - i * dotStep)
        .attr('r', dotRadius)
        .attr('fill', CHART_COLORS.line);
    }
  }

  containerEl.appendChild(svg.node());
}

/**
 * @param {HTMLElement} containerEl
 * @param {object} config
 * @param {{min:number,max:number,count:number}[]} config.bins
 * @param {number} [config.size=280]
 */
export function renderHistogram(containerEl, config) {
  containerEl.innerHTML = '';
  const { bins, size = 280 } = config;

  const margin = { top: 24, right: 16, bottom: 34, left: 30 };
  const width = size;
  const height = Math.round(size * 0.72);
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const maxCount = Math.max(...bins.map((b) => b.count), 1);

  const x = d3
    .scaleBand()
    .domain(bins.map((_, i) => i))
    .range([margin.left, margin.left + plotWidth])
    .paddingInner(0.08);
  const y = d3
    .scaleLinear()
    .domain([0, maxCount])
    .range([margin.top + plotHeight, margin.top]);

  const svg = baseSvg(width, height, 'Histogram');

  svg
    .append('line')
    .attr('x1', margin.left)
    .attr('x2', margin.left + plotWidth)
    .attr('y1', margin.top + plotHeight)
    .attr('y2', margin.top + plotHeight)
    .attr('stroke', CHART_COLORS.textSecondary)
    .attr('stroke-width', 1.5);

  // y-axis ticks at whole-number counts (skip if maxCount would crowd them).
  const yTickStep = maxCount > 10 ? Math.ceil(maxCount / 5) : 1;
  for (let c = 0; c <= maxCount; c += yTickStep) {
    svg
      .append('line')
      .attr('x1', margin.left)
      .attr('x2', margin.left + plotWidth)
      .attr('y1', y(c))
      .attr('y2', y(c))
      .attr('stroke', CHART_COLORS.gridline)
      .attr('stroke-width', 1);
    svg
      .append('text')
      .attr('x', margin.left - 6)
      .attr('y', y(c) + 3)
      .attr('text-anchor', 'end')
      .attr('font-size', 9)
      .attr('fill', CHART_COLORS.textMuted)
      .text(c);
  }

  bins.forEach((bin, i) => {
    const barTop = y(bin.count);
    svg
      .append('rect')
      .attr('x', x(i))
      .attr('y', barTop)
      .attr('width', x.bandwidth())
      .attr('height', margin.top + plotHeight - barTop)
      .attr('fill', CHART_COLORS.line);
    svg
      .append('text')
      .attr('x', x(i) + x.bandwidth() / 2)
      .attr('y', barTop - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', 11)
      .attr('font-weight', 700)
      .attr('fill', CHART_COLORS.textPrimary)
      .text(bin.count);
    svg
      .append('text')
      .attr('x', x(i) + x.bandwidth() / 2)
      .attr('y', margin.top + plotHeight + 15)
      .attr('text-anchor', 'middle')
      .attr('font-size', 9)
      .attr('fill', CHART_COLORS.textMuted)
      .text(`${bin.min}–${bin.max}`);
  });

  containerEl.appendChild(svg.node());
}

/**
 * @param {HTMLElement} containerEl
 * @param {object} config
 * @param {number} config.min
 * @param {number} config.q1
 * @param {number} config.median
 * @param {number} config.q3
 * @param {number} config.max
 * @param {number} [config.size=280]
 */
export function renderBoxPlot(containerEl, config) {
  containerEl.innerHTML = '';
  const { min, q1, median, q3, max, size = 280 } = config;

  const margin = { top: 20, right: 24, bottom: 34, left: 24 };
  const width = size;
  const height = 110;
  const plotWidth = width - margin.left - margin.right;
  const midY = margin.top + 28;
  const boxHeight = 32;
  const capHeight = 16;

  const pad = Math.max(1, (max - min) * 0.12) || 1;
  const x = d3
    .scaleLinear()
    .domain([min - pad, max + pad])
    .range([margin.left, margin.left + plotWidth]);

  const svg = baseSvg(width, height, 'Box plot');

  // Whiskers.
  svg.append('line').attr('x1', x(min)).attr('x2', x(q1)).attr('y1', midY).attr('y2', midY).attr('stroke', CHART_COLORS.textSecondary).attr('stroke-width', 2);
  svg.append('line').attr('x1', x(q3)).attr('x2', x(max)).attr('y1', midY).attr('y2', midY).attr('stroke', CHART_COLORS.textSecondary).attr('stroke-width', 2);

  // End caps at min/max.
  for (const value of [min, max]) {
    svg
      .append('line')
      .attr('x1', x(value))
      .attr('x2', x(value))
      .attr('y1', midY - capHeight / 2)
      .attr('y2', midY + capHeight / 2)
      .attr('stroke', CHART_COLORS.textSecondary)
      .attr('stroke-width', 2);
  }

  // Box from Q1 to Q3.
  svg
    .append('rect')
    .attr('x', x(q1))
    .attr('y', midY - boxHeight / 2)
    .attr('width', Math.max(x(q3) - x(q1), 1))
    .attr('height', boxHeight)
    .attr('fill', '#eef1fb')
    .attr('stroke', CHART_COLORS.line)
    .attr('stroke-width', 2);

  // Median line.
  svg
    .append('line')
    .attr('x1', x(median))
    .attr('x2', x(median))
    .attr('y1', midY - boxHeight / 2)
    .attr('y2', midY + boxHeight / 2)
    .attr('stroke', CHART_COLORS.line)
    .attr('stroke-width', 2.5);

  // Value labels below each of the five marks. Nudge neighbors apart a little
  // if two marks land close together, same edge-clipping lesson as the
  // coordinate plane: text-anchor alone isn't enough once labels can collide.
  const marks = [
    { value: min, text: `min: ${min}` },
    { value: q1, text: `Q1: ${q1}` },
    { value: median, text: `med: ${median}` },
    { value: q3, text: `Q3: ${q3}` },
    { value: max, text: `max: ${max}` },
  ].sort((a, b) => a.value - b.value);

  let lastLabelRight = -Infinity;
  for (const mark of marks) {
    const approxHalfWidth = mark.text.length * 2.8;
    let anchorX = x(mark.value);
    if (anchorX - approxHalfWidth < lastLabelRight) {
      anchorX = lastLabelRight + approxHalfWidth;
    }
    lastLabelRight = anchorX + approxHalfWidth;
    svg
      .append('text')
      .attr('x', Math.min(anchorX, width - approxHalfWidth))
      .attr('y', midY + boxHeight / 2 + 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .attr('fill', CHART_COLORS.textMuted)
      .text(mark.text);
  }

  containerEl.appendChild(svg.node());
}
