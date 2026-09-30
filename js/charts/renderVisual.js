// Dispatches a problem's `visual` field to the right chart renderer. Views
// (quizView, worksheetView) call this instead of talking to individual chart
// modules directly, so adding a new visual type later means one new case
// here, not a change everywhere a chart gets mounted.
import { renderCoordinatePlane } from './coordinatePlane.js';
import { renderDotPlot, renderHistogram, renderBoxPlot } from './dataPlots.js';

const RENDERERS = {
  coordinatePlane: renderCoordinatePlane,
  dotPlot: renderDotPlot,
  histogram: renderHistogram,
  boxPlot: renderBoxPlot,
};

export function renderVisual(containerEl, visual) {
  const renderer = RENDERERS[visual.type] || renderCoordinatePlane;
  return renderer(containerEl, visual);
}
