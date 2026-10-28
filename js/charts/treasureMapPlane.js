// Treasure-map-themed coordinate grid for Coordinate Treasure Hunt, kept
// fully independent of js/charts/coordinatePlane.js (shared by the Quiz
// view, the Worksheet Builder, and Lesson checkpoints) — a parchment
// background, ink-brown gridlines, a red "X" for an unconfirmed guess, and a
// big landmark emoji for a confirmed find can diverge freely here with zero
// risk of changing how those other surfaces look. Same d3-based approach and
// scale math as coordinatePlane.js, just simplified to only what this one
// game needs (no polygon/segment/multi-point support).
const TREASURE_COLORS = {
  parchmentLight: '#f3e3bd',
  parchmentDark: '#e0c789',
  ink: '#5a3d1f',
  gridline: '#c9ad6e',
  guess: '#b3261e',
};

const PARCHMENT_GRADIENT_ID = 'treasure-map-parchment-gradient';

/**
 * @param {HTMLElement} containerEl
 * @param {object} config
 * @param {number} [config.range=10] - grid spans [-range, range] on both axes (or [0, range] if quadrant1 is set)
 * @param {boolean} [config.quadrant1=false] - restrict the grid to the first quadrant only, for grade 5
 * @param {number} [config.size=280] - pixel width/height (square)
 * @param {boolean} [config.interactive] - if true, clicking the grid calls onPlace(x, y)
 * @param {{x:number,y:number}|null} [config.marker] - the player's current (unconfirmed/wrong) guess, drawn as a red X
 * @param {{x:number,y:number,icon:string}|null} [config.revealIcon] - a confirmed landmark, drawn as a big emoji
 * @param {(x:number, y:number) => void} [config.onPlace]
 */
export function renderTreasureMap(containerEl, config) {
  containerEl.innerHTML = '';
  const { range = 10, quadrant1 = false, size = 280, interactive = false, marker = null, revealIcon = null, onPlace = null } = config;
  const minVal = quadrant1 ? 0 : -range;

  const margin = 22;
  const plotSize = size - margin * 2;
  const scaleX = d3.scaleLinear().domain([minVal, range]).range([margin, margin + plotSize]);
  const scaleY = d3.scaleLinear().domain([minVal, range]).range([margin + plotSize, margin]);
  const cellPx = plotSize / (range - minVal);

  const svg = d3
    .create('svg')
    .attr('viewBox', `0 0 ${size} ${size}`)
    .attr('width', size)
    .attr('height', size)
    .attr('role', 'img')
    .attr('aria-label', 'Treasure map grid')
    .style('print-color-adjust', 'exact')
    .style('-webkit-print-color-adjust', 'exact');

  const gradient = svg
    .append('defs')
    .append('linearGradient')
    .attr('id', PARCHMENT_GRADIENT_ID)
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '100%')
    .attr('y2', '100%');
  gradient.append('stop').attr('offset', '0%').attr('stop-color', TREASURE_COLORS.parchmentLight);
  gradient.append('stop').attr('offset', '100%').attr('stop-color', TREASURE_COLORS.parchmentDark);
  svg
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', size)
    .attr('height', size)
    .attr('rx', 10)
    .attr('fill', `url(#${PARCHMENT_GRADIENT_ID})`);

  const ticks = d3.range(minVal, range + 1);

  svg
    .append('g')
    .selectAll('line')
    .data(ticks)
    .join('line')
    .attr('x1', (d) => scaleX(d))
    .attr('x2', (d) => scaleX(d))
    .attr('y1', margin)
    .attr('y2', margin + plotSize)
    .attr('stroke', TREASURE_COLORS.gridline)
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
    .attr('stroke', TREASURE_COLORS.gridline)
    .attr('stroke-width', (d) => (d === 0 ? 0 : 1));

  // Axes through the origin, bold ink.
  svg
    .append('line')
    .attr('x1', margin)
    .attr('x2', margin + plotSize)
    .attr('y1', scaleY(0))
    .attr('y2', scaleY(0))
    .attr('stroke', TREASURE_COLORS.ink)
    .attr('stroke-width', 2);
  svg
    .append('line')
    .attr('y1', margin)
    .attr('y2', margin + plotSize)
    .attr('x1', scaleX(0))
    .attr('x2', scaleX(0))
    .attr('stroke', TREASURE_COLORS.ink)
    .attr('stroke-width', 2);

  // A light halo (a stroke painted behind the fill) keeps these digits
  // legible wherever they land on the parchment gradient, rather than
  // relying on ink color alone for contrast.
  const labelStep = range <= 6 ? 1 : range <= 12 ? 2 : 5;
  const labelTicks = ticks.filter((d) => d !== 0 && d % labelStep === 0);
  svg
    .append('g')
    .selectAll('text')
    .data(labelTicks)
    .join('text')
    .attr('x', (d) => scaleX(d))
    .attr('y', scaleY(0) + 13)
    .attr('text-anchor', 'middle')
    .attr('font-size', 11)
    .attr('font-weight', 700)
    .attr('fill', TREASURE_COLORS.ink)
    .attr('stroke', '#fffdf6')
    .attr('stroke-width', 3)
    .style('paint-order', 'stroke')
    .text((d) => d);
  svg
    .append('g')
    .selectAll('text')
    .data(labelTicks)
    .join('text')
    .attr('y', (d) => scaleY(d) + 4)
    .attr('x', scaleX(0) - 7)
    .attr('text-anchor', 'end')
    .attr('font-size', 11)
    .attr('font-weight', 700)
    .attr('fill', TREASURE_COLORS.ink)
    .attr('stroke', '#fffdf6')
    .attr('stroke-width', 3)
    .style('paint-order', 'stroke')
    .text((d) => d);

  // A small compass rose in the corner, purely for flavor.
  svg
    .append('text')
    .attr('x', margin + plotSize - 14)
    .attr('y', margin + 18)
    .attr('text-anchor', 'middle')
    .attr('font-size', 16)
    .text('🧭');

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
      .attr('aria-label', 'Click to search the treasure map')
      .on('click', (event) => {
        const [px, py] = d3.pointer(event);
        const x = Math.max(minVal, Math.min(range, Math.round(scaleX.invert(px))));
        const y = Math.max(minVal, Math.min(range, Math.round(scaleY.invert(py))));
        if (onPlace) onPlace(x, y);
      });
  }

  if (marker) {
    const mx = scaleX(marker.x);
    const my = scaleY(marker.y);
    const armLen = Math.min(10, cellPx * 0.3);
    const xGroup = svg.append('g').attr('stroke', TREASURE_COLORS.guess).attr('stroke-width', 3).attr('stroke-linecap', 'round');
    xGroup
      .append('line')
      .attr('x1', mx - armLen)
      .attr('y1', my - armLen)
      .attr('x2', mx + armLen)
      .attr('y2', my + armLen);
    xGroup
      .append('line')
      .attr('x1', mx - armLen)
      .attr('y1', my + armLen)
      .attr('x2', mx + armLen)
      .attr('y2', my - armLen);
  }

  if (revealIcon) {
    const rx = scaleX(revealIcon.x);
    const ry = scaleY(revealIcon.y);
    const iconRadius = Math.min(18, cellPx * 0.42);
    svg
      .append('circle')
      .attr('cx', rx)
      .attr('cy', ry)
      .attr('r', iconRadius + 5)
      .attr('fill', '#fff')
      .attr('fill-opacity', 0.7)
      .attr('stroke', TREASURE_COLORS.ink)
      .attr('stroke-width', 1.5);
    svg
      .append('text')
      .attr('x', rx)
      .attr('y', ry)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', iconRadius * 1.6)
      .text(revealIcon.icon);
  }

  containerEl.appendChild(svg.node());
  return svg.node();
}
