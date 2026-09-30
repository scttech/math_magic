// A small coordinate-plane grid, rendered with d3 (global, loaded via
// js/vendor/d3.v7.min.js — see chartTheme.js for why chart modules don't
// import it). Used two ways: read-only (plot given points/a polygon/a
// distance segment for the student to read) and interactive (student clicks
// to place a point, snapped to the nearest integer). The exact same function
// renders into the Quiz view, the Worksheet Builder's on-screen preview, and
// the printed worksheet — it just mounts an SVG into whatever container
// element it's given.
import { CHART_COLORS } from './chartTheme.js';

const POINT_RADIUS = 6;

/**
 * @param {HTMLElement} containerEl
 * @param {object} config
 * @param {number} [config.range=10] - grid spans [-range, range] on both axes
 * @param {number} [config.size=280] - pixel width/height (square)
 * @param {{x:number,y:number,label?:string}[]} [config.points]
 * @param {{x:number,y:number,label?:string}[]} [config.polygon] - connected in order and closed; drawn instead of `points`
 * @param {[{x,y},{x,y}]} [config.segment] - dashed line between two points
 * @param {boolean} [config.interactive] - if true, clicking the grid calls onPlace(x, y)
 * @param {{x:number,y:number}|null} [config.marker] - the currently-placed point, in interactive mode
 * @param {(x:number, y:number) => void} [config.onPlace]
 */
export function renderCoordinatePlane(containerEl, config) {
  containerEl.innerHTML = '';
  const { range = 10, size = 280, points = [], polygon = null, segment = null, interactive = false, marker = null, onPlace = null } = config;

  const margin = 22;
  const plotSize = size - margin * 2;
  const scaleX = d3.scaleLinear().domain([-range, range]).range([margin, margin + plotSize]);
  const scaleY = d3.scaleLinear().domain([-range, range]).range([margin + plotSize, margin]);

  const svg = d3
    .create('svg')
    .attr('viewBox', `0 0 ${size} ${size}`)
    .attr('width', size)
    .attr('height', size)
    .attr('role', 'img')
    .attr('aria-label', 'Coordinate plane grid')
    .style('print-color-adjust', 'exact')
    .style('-webkit-print-color-adjust', 'exact');

  const ticks = d3.range(-range, range + 1);

  svg
    .append('g')
    .selectAll('line')
    .data(ticks)
    .join('line')
    .attr('x1', (d) => scaleX(d))
    .attr('x2', (d) => scaleX(d))
    .attr('y1', margin)
    .attr('y2', margin + plotSize)
    .attr('stroke', CHART_COLORS.gridline)
    .attr('stroke-width', (d) => (d === 0 ? 0 : 1));

  svg
    .append('g')
    .selectAll('line')
    .data(ticks)
    .join('line')
    .attr('y1', (d) => scaleY(d))
    .attr('y2', (d) => scaleY(d))
    .attr('x1', margin)
    .attr('x2', margin + plotSize)
    .attr('stroke', CHART_COLORS.gridline)
    .attr('stroke-width', (d) => (d === 0 ? 0 : 1));

  // Axes through the origin.
  svg
    .append('line')
    .attr('x1', margin)
    .attr('x2', margin + plotSize)
    .attr('y1', scaleY(0))
    .attr('y2', scaleY(0))
    .attr('stroke', CHART_COLORS.textSecondary)
    .attr('stroke-width', 1.5);
  svg
    .append('line')
    .attr('y1', margin)
    .attr('y2', margin + plotSize)
    .attr('x1', scaleX(0))
    .attr('x2', scaleX(0))
    .attr('stroke', CHART_COLORS.textSecondary)
    .attr('stroke-width', 1.5);

  // Tick labels, spaced out for larger ranges so they don't collide.
  const labelStep = range <= 6 ? 1 : range <= 12 ? 2 : 5;
  const labelTicks = ticks.filter((d) => d !== 0 && d % labelStep === 0);
  svg
    .append('g')
    .selectAll('text')
    .data(labelTicks)
    .join('text')
    .attr('x', (d) => scaleX(d))
    .attr('y', scaleY(0) + 12)
    .attr('text-anchor', 'middle')
    .attr('font-size', 9)
    .attr('fill', CHART_COLORS.textMuted)
    .text((d) => d);
  svg
    .append('g')
    .selectAll('text')
    .data(labelTicks)
    .join('text')
    .attr('y', (d) => scaleY(d) + 3)
    .attr('x', scaleX(0) - 6)
    .attr('text-anchor', 'end')
    .attr('font-size', 9)
    .attr('fill', CHART_COLORS.textMuted)
    .text((d) => d);

  if (polygon && polygon.length > 1) {
    const lineGen = d3
      .line()
      .x((p) => scaleX(p.x))
      .y((p) => scaleY(p.y));
    svg
      .append('path')
      .attr('d', lineGen([...polygon, polygon[0]]))
      .attr('fill', 'none')
      .attr('stroke', CHART_COLORS.line)
      .attr('stroke-width', 2);
  }

  if (segment) {
    const [a, b] = segment;
    svg
      .append('line')
      .attr('x1', scaleX(a.x))
      .attr('y1', scaleY(a.y))
      .attr('x2', scaleX(b.x))
      .attr('y2', scaleY(b.y))
      .attr('stroke', CHART_COLORS.line)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,3');
  }

  const shownPoints = polygon || points;
  const pointsGroup = svg.append('g');
  pointsGroup
    .selectAll('circle')
    .data(shownPoints)
    .join('circle')
    .attr('cx', (p) => scaleX(p.x))
    .attr('cy', (p) => scaleY(p.y))
    .attr('r', POINT_RADIUS)
    .attr('fill', CHART_COLORS.line)
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5);
  // Flip the label to the other side of its point when it would otherwise run
  // past the grid's edge — labels like "Answer" are wide enough that this
  // matters near the right edge in particular.
  const LABEL_EDGE_BUFFER = 50;
  pointsGroup
    .selectAll('text')
    .data(shownPoints.filter((p) => p.label))
    .join('text')
    .attr('x', (p) => (scaleX(p.x) > margin + plotSize - LABEL_EDGE_BUFFER ? scaleX(p.x) - 8 : scaleX(p.x) + 8))
    .attr('y', (p) => (scaleY(p.y) < margin + 12 ? scaleY(p.y) + 16 : scaleY(p.y) - 8))
    .attr('text-anchor', (p) => (scaleX(p.x) > margin + plotSize - LABEL_EDGE_BUFFER ? 'end' : 'start'))
    .attr('font-size', 12)
    .attr('font-weight', 700)
    .attr('fill', CHART_COLORS.textPrimary)
    .text((p) => p.label);

  if (interactive) {
    svg
      .append('rect')
      .attr('x', margin)
      .attr('y', margin)
      .attr('width', plotSize)
      .attr('height', plotSize)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair')
      .attr('role', 'application')
      .attr('tabindex', 0)
      .attr('aria-label', 'Click to plot a point on the grid')
      .on('click', (event) => {
        const [px, py] = d3.pointer(event);
        const x = Math.max(-range, Math.min(range, Math.round(scaleX.invert(px))));
        const y = Math.max(-range, Math.min(range, Math.round(scaleY.invert(py))));
        if (onPlace) onPlace(x, y);
      });
  }

  if (marker) {
    svg
      .append('circle')
      .attr('cx', scaleX(marker.x))
      .attr('cy', scaleY(marker.y))
      .attr('r', POINT_RADIUS + 2)
      .attr('fill', 'none')
      .attr('stroke', CHART_COLORS.status.good)
      .attr('stroke-width', 2.5);
    svg.append('circle').attr('cx', scaleX(marker.x)).attr('cy', scaleY(marker.y)).attr('r', 2).attr('fill', CHART_COLORS.status.good);
  }

  containerEl.appendChild(svg.node());
  return svg.node();
}
