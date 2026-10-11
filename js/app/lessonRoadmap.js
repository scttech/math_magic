// Renders a winding "roadmap" path for a sequence of lessons — a Duolingo-style
// trail of nodes a student can see progress on and click to jump to any lesson
// (there's no locking; the path is a status map, not a gate). The winding line
// itself is a plain SVG (no library, same approach as the chart/shape
// renderers); the nodes are real HTML elements layered on top so they stay
// properly clickable, accessible, and able to wrap a lesson title across lines.
const NODE_SPACING = 180;
const TOP_PADDING = 70;
const BOTTOM_PADDING = 70;
const LEFT_X = 25; // percent
const RIGHT_X = 75; // percent

const STATUS_LABEL = { 'not-started': 'Not started', 'in-progress': 'In progress', completed: 'Completed' };

// A playful palette pulled from the site's wizard hero image: wand/star gold,
// the robe's purple, and the swirl of bright numeral colors around it. Each
// not-yet-finished node cycles through these so the path itself looks like
// fun, not a form — completion always turns a node gold, regardless of its
// own color, so "done" reads the same way everywhere.
const NODE_COLORS = ['#4a6fd9', '#9b5de5', '#1fb6a6', '#f2994a', '#e8558c', '#3fb950', '#5aa9e6'];

function nodeColor(index) {
  return NODE_COLORS[index % NODE_COLORS.length];
}

let roadmapInstanceCounter = 0;

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function nodeX(index) {
  return index % 2 === 0 ? LEFT_X : RIGHT_X;
}

function nodeY(index) {
  return TOP_PADDING + index * NODE_SPACING;
}

// Each node's title + status text sits directly below its circle, so a
// control point with the same x as its node (a purely vertical departure/
// arrival) sends the dotted trail straight through that text. Blending the
// control points partway toward the other node's x instead makes the trail
// peel away sideways right from the start, clearing the label underneath
// before it has traveled far.
function segmentPath(x1, y1, x2, y2) {
  const gap = (y2 - y1) * 0.45;
  const cp1x = x1 + (x2 - x1) * 0.45;
  const cp2x = x2 - (x2 - x1) * 0.45;
  return `M ${x1} ${y1} C ${cp1x} ${y1 + gap}, ${cp2x} ${y2 - gap}, ${x2} ${y2}`;
}

/**
 * @param {HTMLElement} containerEl
 * @param {{ lesson: object, status: 'not-started'|'in-progress'|'completed' }[]} entries - in path order
 */
export function renderLessonRoadmap(containerEl, entries) {
  containerEl.innerHTML = '';
  if (entries.length === 0) return;

  roadmapInstanceCounter += 1;
  const instanceId = roadmapInstanceCounter;

  const totalHeight = TOP_PADDING + (entries.length - 1) * NODE_SPACING + BOTTOM_PADDING;

  const root = document.createElement('div');
  root.className = 'lesson-roadmap';
  root.style.height = `${totalHeight}px`;

  // One gradient + path per segment, each running from the color of the node
  // it leaves to the color of the node it arrives at — so the trail always
  // blends into whatever circle it's heading toward, never an unrelated hue.
  let defs = '';
  let paths = '';
  for (let i = 1; i < entries.length; i++) {
    const x1 = nodeX(i - 1);
    const y1 = nodeY(i - 1);
    const x2 = nodeX(i);
    const y2 = nodeY(i);
    const gradientId = `lesson-roadmap-trail-${instanceId}-${i}`;
    defs += `<linearGradient id="${gradientId}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
      <stop offset="0%" stop-color="${nodeColor(i - 1)}" />
      <stop offset="100%" stop-color="${nodeColor(i)}" />
    </linearGradient>`;
    paths += `<path d="${segmentPath(x1, y1, x2, y2)}" fill="none" stroke="url(#${gradientId})" stroke-width="7" stroke-dasharray="1 13" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
  }
  root.innerHTML = `
    <svg class="lesson-roadmap-path" viewBox="0 0 100 ${totalHeight}" preserveAspectRatio="none" aria-hidden="true">
      <defs>${defs}</defs>
      ${paths}
    </svg>`;

  entries.forEach(({ lesson, status }, index) => {
    const node = document.createElement('a');
    node.className = `lesson-roadmap-node status-${status}`;
    node.href = `lesson.html?id=${encodeURIComponent(lesson.id)}`;
    node.style.left = `${nodeX(index)}%`;
    node.style.top = `${nodeY(index)}px`;
    node.style.setProperty('--node-color', nodeColor(index));
    node.setAttribute('aria-label', `${lesson.title} — ${STATUS_LABEL[status]}`);
    node.innerHTML = `
      <span class="lesson-roadmap-node-circle">${status === 'completed' ? '★' : index + 1}</span>
      <span class="lesson-roadmap-node-label">${escapeHtml(lesson.title)}</span>
      <span class="lesson-roadmap-node-status">${STATUS_LABEL[status]}</span>`;
    root.appendChild(node);
  });

  containerEl.appendChild(root);
}
