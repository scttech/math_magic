// Draws each shape as a small SVG line-art icon. Plain SVG (no d3) — these are
// static diagrams, not data-driven charts, so js/skills/ stays independent of
// js/charts/. Every drawer works in a fixed internal 160x160 coordinate space;
// renderShape() scales that into whatever display size the caller asks for
// via the SVG's viewBox, so the drawing math never has to change.
const STROKE = '#4a6fd9';
const STROKE_WIDTH = 3;
const VIEWBOX_SIZE = 160;
const CX = VIEWBOX_SIZE / 2;
const CY = VIEWBOX_SIZE / 2;

function polygon(points) {
  return `<polygon points="${points}" fill="none" stroke="${STROKE}" stroke-width="${STROKE_WIDTH}" stroke-linejoin="round" />`;
}

function line(x1, y1, x2, y2, extra = '') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${STROKE}" stroke-width="${STROKE_WIDTH}" ${extra} />`;
}

function regularPolygonPoints(sides, cx, cy, radius) {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const angle = (-90 + (360 / sides) * i) * (Math.PI / 180);
    pts.push(`${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`);
  }
  return pts.join(' ');
}

// --- 2D shapes ---------------------------------------------------------------

function drawTriangle() {
  return polygon(regularPolygonPoints(3, CX, CY + 10, 60));
}
function drawSquare() {
  return `<rect x="${CX - 50}" y="${CY - 50}" width="100" height="100" fill="none" stroke="${STROKE}" stroke-width="${STROKE_WIDTH}" />`;
}
function drawRectangle() {
  return `<rect x="${CX - 65}" y="${CY - 40}" width="130" height="80" fill="none" stroke="${STROKE}" stroke-width="${STROKE_WIDTH}" />`;
}
function drawPentagon() {
  return polygon(regularPolygonPoints(5, CX, CY, 58));
}
function drawHexagon() {
  return polygon(regularPolygonPoints(6, CX, CY, 58));
}
function drawHeptagon() {
  return polygon(regularPolygonPoints(7, CX, CY, 58));
}
function drawOctagon() {
  return polygon(regularPolygonPoints(8, CX, CY, 58));
}
function drawCircle() {
  return `<circle cx="${CX}" cy="${CY}" r="58" fill="none" stroke="${STROKE}" stroke-width="${STROKE_WIDTH}" />`;
}
function drawRhombus() {
  return polygon(regularPolygonPoints(4, CX, CY, 62));
}
function drawTrapezoid() {
  const topHalf = 35;
  const bottomHalf = 65;
  const halfHeight = 40;
  return polygon(`${CX - topHalf},${CY - halfHeight} ${CX + topHalf},${CY - halfHeight} ${CX + bottomHalf},${CY + halfHeight} ${CX - bottomHalf},${CY + halfHeight}`);
}
function drawParallelogram() {
  const halfWidth = 55;
  const skew = 25;
  const halfHeight = 40;
  return polygon(
    `${CX - halfWidth + skew},${CY - halfHeight} ${CX + halfWidth},${CY - halfHeight} ${CX + halfWidth - skew},${CY + halfHeight} ${CX - halfWidth},${CY + halfHeight}`
  );
}

// --- 3D shapes (simple isometric-style line art) ------------------------------

function drawBox(frontW, frontH, dx, dy) {
  const x0 = CX - frontW / 2 - dx / 2;
  const y0 = CY - frontH / 2 - dy / 2 + 10;
  const flx = x0;
  const fty = y0;
  const frx = x0 + frontW;
  const fby = y0 + frontH;
  const front = polygon(`${flx},${fty} ${frx},${fty} ${frx},${fby} ${flx},${fby}`);
  const top = polygon(`${flx},${fty} ${flx + dx},${fty + dy} ${frx + dx},${fty + dy} ${frx},${fty}`);
  const side = polygon(`${frx},${fty} ${frx + dx},${fty + dy} ${frx + dx},${fby + dy} ${frx},${fby}`);
  return front + top + side;
}
function drawCube() {
  return drawBox(80, 80, 26, -22);
}
function drawRectangularPrism() {
  return drawBox(104, 62, 26, -22);
}
function drawTriangularPrism() {
  // A "tent" depiction (triangular end cap + the ridge line receding into the
  // body) reads far more clearly at icon size than two overlapping triangles
  // offset by a small amount, which just looks like visual noise.
  const apex = { x: 50, y: 35 };
  const baseL = { x: 25, y: 115 };
  const baseR = { x: 85, y: 115 };
  const depth = 55;
  const ridgeEnd = { x: apex.x + depth, y: apex.y };
  const baseRFar = { x: baseR.x + depth, y: baseR.y };
  const cap = polygon(`${apex.x},${apex.y} ${baseL.x},${baseL.y} ${baseR.x},${baseR.y}`);
  const roof = line(apex.x, apex.y, ridgeEnd.x, ridgeEnd.y);
  const rightEdge = line(ridgeEnd.x, ridgeEnd.y, baseRFar.x, baseRFar.y);
  const bottomEdge = line(baseR.x, baseR.y, baseRFar.x, baseRFar.y);
  return cap + roof + rightEdge + bottomEdge;
}
function drawCylinder() {
  const rx = 45;
  const ry = 16;
  const topY = CY - 45;
  const bottomY = CY + 45;
  return (
    `<ellipse cx="${CX}" cy="${topY}" rx="${rx}" ry="${ry}" fill="none" stroke="${STROKE}" stroke-width="${STROKE_WIDTH}" />` +
    `<ellipse cx="${CX}" cy="${bottomY}" rx="${rx}" ry="${ry}" fill="none" stroke="${STROKE}" stroke-width="${STROKE_WIDTH}" />` +
    line(CX - rx, topY, CX - rx, bottomY) +
    line(CX + rx, topY, CX + rx, bottomY)
  );
}
function drawCone() {
  const rx = 48;
  const ry = 16;
  const baseY = CY + 45;
  const apexY = CY - 50;
  return (
    `<ellipse cx="${CX}" cy="${baseY}" rx="${rx}" ry="${ry}" fill="none" stroke="${STROKE}" stroke-width="${STROKE_WIDTH}" />` +
    line(CX - rx, baseY, CX, apexY) +
    line(CX + rx, baseY, CX, apexY)
  );
}
function drawSphere() {
  return (
    `<circle cx="${CX}" cy="${CY}" r="55" fill="none" stroke="${STROKE}" stroke-width="${STROKE_WIDTH}" />` +
    `<ellipse cx="${CX}" cy="${CY}" rx="55" ry="16" fill="none" stroke="${STROKE}" stroke-width="2" />`
  );
}
function drawSquarePyramid() {
  const apex = { x: CX, y: CY - 55 };
  const left = { x: CX - 55, y: CY + 20 };
  const right = { x: CX + 55, y: CY + 20 };
  const back = { x: CX + 8, y: CY };
  const front = { x: CX - 8, y: CY + 38 };
  const base = polygon(`${left.x},${left.y} ${back.x},${back.y} ${right.x},${right.y} ${front.x},${front.y}`);
  const edges =
    line(apex.x, apex.y, left.x, left.y) +
    line(apex.x, apex.y, right.x, right.y) +
    line(apex.x, apex.y, front.x, front.y) +
    line(apex.x, apex.y, back.x, back.y, 'stroke-width="2" stroke-dasharray="3,3"');
  return base + edges;
}

const DRAWERS = {
  triangle: drawTriangle,
  square: drawSquare,
  rectangle: drawRectangle,
  pentagon: drawPentagon,
  hexagon: drawHexagon,
  heptagon: drawHeptagon,
  octagon: drawOctagon,
  circle: drawCircle,
  rhombus: drawRhombus,
  trapezoid: drawTrapezoid,
  parallelogram: drawParallelogram,
  cube: drawCube,
  rectangularPrism: drawRectangularPrism,
  triangularPrism: drawTriangularPrism,
  cylinder: drawCylinder,
  cone: drawCone,
  sphere: drawSphere,
  squarePyramid: drawSquarePyramid,
};

export const SHAPE_IDS = Object.keys(DRAWERS);

export function renderShape(containerEl, shapeId, displaySize = VIEWBOX_SIZE) {
  const drawer = DRAWERS[shapeId];
  containerEl.innerHTML = drawer
    ? `<svg viewBox="0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}" width="${displaySize}" height="${displaySize}" role="img" aria-label="A geometric shape to identify">${drawer()}</svg>`
    : '';
}
