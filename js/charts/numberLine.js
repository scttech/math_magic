// A small number-line visual, rendered with d3 (global, loaded via
// js/vendor/d3.v7.min.js — see chartTheme.js for why chart modules don't
// import it). Static/illustrative only: marks one or more points on a
// horizontal line, with an optional highlighted span between two values
// (e.g. the "jump" from a starting value to an ending one, or the distance
// from 0 for an absolute-value problem). Renders identically into the Quiz
// view, the Worksheet Builder's on-screen preview and printed output, and
// Learn checkpoints — whatever container element it's given.
import { CHART_COLORS } from './chartTheme.js';

const POINT_RADIUS = 6;

/**
 * @param {HTMLElement} containerEl
 * @param {object} config
 * @param {number} config.min - left end of the line (inclusive)
 * @param {number} config.max - right end of the line (inclusive)
 * @param {number} [config.width=320]
 * @param {number} [config.height=110]
 * @param {{value:number,label?:string}[]} [config.points]
 * @param {[number, number]} [config.span] - highlights the stretch of the line between two values
 */
export function renderNumberLine(containerEl, config) {
  containerEl.innerHTML = '';
  const { min, max, width = 320, height = 110, points = [], span = null } = config;

  const margin = 24;
  const lineWidth = width - margin * 2;
  const scaleX = d3.scaleLinear().domain([min, max]).range([margin, margin + lineWidth]);
  const lineY = height / 2;

  const svg = d3
    .create('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('width', width)
    .attr('height', height)
    .attr('role', 'img')
    .attr('aria-label', 'Number line')
    .style('print-color-adjust', 'exact')
    .style('-webkit-print-color-adjust', 'exact');

  svg
    .append('line')
    .attr('x1', margin)
    .attr('x2', margin + lineWidth)
    .attr('y1', lineY)
    .attr('y2', lineY)
    .attr('stroke', CHART_COLORS.textSecondary)
    .attr('stroke-width', 1.5);

  if (span) {
    const [from, to] = span;
    svg
      .append('line')
      .attr('x1', scaleX(Math.min(from, to)))
      .attr('x2', scaleX(Math.max(from, to)))
      .attr('y1', lineY)
      .attr('y2', lineY)
      .attr('stroke', CHART_COLORS.line)
      .attr('stroke-width', 4)
      .attr('stroke-linecap', 'round');
  }

  // Ticks + labels, spaced out for larger ranges so they don't collide.
  const spanSize = max - min;
  const tickStep = spanSize <= 20 ? 1 : spanSize <= 50 ? 5 : spanSize <= 120 ? 10 : 20;
  const ticks = d3.range(Math.ceil(min / tickStep) * tickStep, max + 1, tickStep);
  svg
    .append('g')
    .selectAll('line')
    .data(ticks)
    .join('line')
    .attr('x1', (d) => scaleX(d))
    .attr('x2', (d) => scaleX(d))
    .attr('y1', lineY - 5)
    .attr('y2', lineY + 5)
    .attr('stroke', CHART_COLORS.textSecondary)
    .attr('stroke-width', 1);
  svg
    .append('g')
    .selectAll('text')
    .data(ticks)
    .join('text')
    .attr('x', (d) => scaleX(d))
    .attr('y', lineY + 22)
    .attr('text-anchor', 'middle')
    .attr('font-size', 9)
    .attr('fill', CHART_COLORS.textMuted)
    .text((d) => d);

  if (min <= 0 && max >= 0 && !ticks.includes(0)) {
    svg.append('line').attr('x1', scaleX(0)).attr('x2', scaleX(0)).attr('y1', lineY - 5).attr('y2', lineY + 5).attr('stroke', CHART_COLORS.textSecondary).attr('stroke-width', 1);
  }

  const pointsGroup = svg.append('g');
  pointsGroup
    .selectAll('circle')
    .data(points)
    .join('circle')
    .attr('cx', (p) => scaleX(p.value))
    .attr('cy', lineY)
    .attr('r', POINT_RADIUS)
    .attr('fill', CHART_COLORS.line)
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5);

  pointsGroup
    .selectAll('text')
    .data(points.filter((p) => p.label))
    .join('text')
    .attr('x', (p) => scaleX(p.value))
    .attr('y', lineY - 14)
    .attr('text-anchor', 'middle')
    .attr('font-size', 12)
    .attr('font-weight', 700)
    .attr('fill', CHART_COLORS.textPrimary)
    .text((p) => p.label);

  containerEl.appendChild(svg.node());
  return svg.node();
}
